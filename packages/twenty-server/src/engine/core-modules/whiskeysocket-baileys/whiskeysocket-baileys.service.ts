import { Injectable } from '@nestjs/common';
import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import readline from 'readline';
import makeWASocket, {
  AnyMessageContent,
  delay,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  proto,
  useMultiFileAuthState,
  WAMessageContent,
  WAMessageKey,
  downloadMediaMessage,
} from '@whiskeysockets/baileys';
import * as fs from 'fs';
import * as path from 'path';
import { question } from './helpers/auth';
import { makeStore } from './helpers/store';
import MAIN_LOGGER from '@whiskeysockets/baileys/lib/Utils/logger';
import { IncomingWhatsappMessages } from '../arx-chat/services/whatsapp-api/incoming-messages';
import { BaileysIncomingMessage } from '../arx-chat/services/data-model-objects';
import { FileDataDto, MessageDto } from './types/baileys-types';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { EventsGateway } from './events-gateway-module/events-gateway';
import { AttachmentProcessingService } from '../arx-chat/services/candidate-engagement/attachment-processing';
import * as allDataObjects from '../arx-chat/services/data-model-objects';
import { FetchAndUpdateCandidatesChatsWhatsapps } from '../arx-chat/services/candidate-engagement/update-chat';
import { axiosRequest } from '../arx-chat/utils/arx-chat-agent-utils';
import { graphqlToFetchWhatsappMessageByCandidateId, graphqlToFetchWhatsappMessageByWhatsappId, graphqlToUpdateWhatsappMessageId } from './graphql-queries';
import {WorkspaceQueryService} from '../workspace-modifications/workspace-modifications.service';

const nodeCache = new NodeCache();

const agent = new SocksProxyAgent(process.env.SMART_PROXY_URL || '');

const apiToken = process.env.TWENTY_JWT_SECRET || '';
// WhatsappService(USER).eventsGateway.emitEvent();

@Injectable()
export class WhatsappService {
  private readonly logger = MAIN_LOGGER.child({});
  private sock: any;
  private store: any = makeStore();
  public whatsappLoginQrString: string = '';

  constructor(
    private readonly workspaceQueryService:WorkspaceQueryService,
    private eventsGateway: EventsGateway,
    private sessionId: string,
    private socketClientId: string,
    private connectionStatus: boolean = false,
  ) {
    this.sessionId = sessionId;
    this.startSock();
    // const workspaceMemberId = this.eventsGateway.workspaceMemberId;
  }

  setSocketClientId(socketClientId: string) {
    console.log('setting socketClientId', socketClientId);
    this.socketClientId = socketClientId;
  }

  sendConnectionUpdate() {
    console.log('sending connection update', this.connectionStatus);
    this.eventsGateway.emitEventTo('isWhatsappLoggedIn', this.connectionStatus, this.socketClientId);
  }

  private async startSock() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info/' + this.sessionId);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);
    this.sock = makeWASocket({
      version,
      agent: agent,
      logger: this.logger,
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, this.logger) },
      msgRetryCounterCache: nodeCache,
      syncFullHistory: true,
    });

    this.store.bind(this.sock.ev);

    this.sock.ev.process(async events => {
      // console.log('Top Events::::', events);
      console.log('Top Events Keys::::', Object.keys(events));

      if (events['connection.update']) {
        const { connection, lastDisconnect, qr } = events['connection.update'];
        if (qr) {
          console.log('Sending the QR through socket to ', this.socketClientId, qr);
          const event = 'qr';
          this.whatsappLoginQrString = qr;
          this?.eventsGateway?.emitEventTo(event, qr, this.socketClientId); // Emit event through the gateway
        }
        if (connection === 'close') {
          console.log("<--Disconnection has happened-->")
          console.log("<--Disconnection has happened status code-->", (lastDisconnect?.error as Boom)?.output?.statusCode)
          console.log("<--Disconnection has happened status output -->", (lastDisconnect?.error as Boom)?.output)
          if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
            this.startSock();
          } else {
            console.log('Connection closed. You are logged out.');
            fs.rm('baileys_auth_info/' + this.sessionId, { recursive: true, force: true }, err => {
              if (err) {
                console.error('Error removing directory:', err);
              } else {
                console.log('Deleting the session directory because the user is logged out and starting the session again');
                this.startSock();
              }
            });
          }
        }
        console.log('connection update', events['connection.update']);
        // this.eventsGateway.updateLoginState(events['connection.update'].connection === 'open'); // Update connection status

        // this.connectionStatus = events['connection.update'].connection === 'open'; // Update connection status
        if (events['connection.update'].connection) {
          console.log('connection update status', events['connection.update'].connection);
          this.connectionStatus = events['connection.update'].connection === 'open'; // Update connection status
          this?.eventsGateway?.emitEventTo('isWhatsappLoggedIn', events['connection.update'].connection === 'open', this.socketClientId); // Emit event through the gateway
        }
      }

      if (events['creds.update']) {
        await saveCreds();
      }

      if (events['messages.upsert']) {
        // console.log('events::::', events);
        const upsert = events['messages.upsert'];
        console.log('Upsert Type::', upsert.type);
        console.log('Upsert::', upsert);
        // console.log("These are events:", JSON.stringify(events, undefined, 2));
        // console.log('recv messages', JSON.stringify(upsert, undefined, 2));
        const selfWhatsappID = this.sock?.user?.id;
        const selfPhoneNumber = selfWhatsappID?.split(':')[0];

        console.log('Phone Number selfWhatsappID:', selfWhatsappID);

        if (upsert.type === 'notify' || upsert.type === 'append') {
          let phoneNumberTo = '';
          try {
            phoneNumberTo = upsert?.messages[0]?.key?.remoteJid?.replace('@s.whatsapp.net', '');
            console.log();
          } catch {
            phoneNumberTo = '';
          }
          console.log('Phone Number TO upsert?.messages[0]?.key?.remoteJid:', phoneNumberTo);

          console.log('Phone Number TO  captured:', selfPhoneNumber);
          for (const msg of upsert.messages) {
            if (!msg.key.fromMe) {
              // console.log('This is the message:', msg);

              let data: any = {
                msg: `got message from:${msg?.pushName}(${msg?.key?.remoteJid}) and message is:${msg?.message?.conversation}`,
                fromName: msg?.pushName,
                fromRemoteJid: msg?.key?.remoteJid,
                message: msg?.message?.conversation || msg?.message?.extendedTextMessage?.text || '',
              };
              // this.eventsGateway.emitEventTo('received', msg?.message?.conversation || msg?.message?.extendedTextMessage?.text, this.socketClientId);

              let event = 'message';
              console.log('replying to', msg.key.remoteJid);
              const whatsappIncomingMessage: allDataObjects.chatMessageType = {
                phoneNumberFrom: '+' + msg?.key?.remoteJid?.replace('@s.whatsapp.net', ''),
                phoneNumberTo: phoneNumberTo,
                messages: [],
                messageType: 'string',
              };

              const candidateProfileData = await new FetchAndUpdateCandidatesChatsWhatsapps(this.workspaceQueryService).getCandidateInformation(whatsappIncomingMessage, apiToken);

              if (msg?.message?.protocolMessage?.type === 0) {
                await this.handleDeleteForEveryoneMessage(msg, candidateProfileData);
                continue;
              }

              if (candidateProfileData == allDataObjects.emptyCandidateProfileObj) {
                continue;
              }

              let isMediaDownloaded = false;
              let isReactionMessage = false;
              let textMessageToSend = msg?.message?.conversation || msg?.message?.extendedTextMessage?.text || (isMediaDownloaded && 'Attachment Received') || '';
              if (msg?.message?.messageType === 'imageMessage' || 'videoMessage' || 'documentMessage' || 'messageContextInfo') {
                isMediaDownloaded = true;
              }

              if (msg?.message?.reactionMessage) {
                isReactionMessage = true;
                const whatsappMessageReacted: {
                  data: {
                    whatsappMessage: {
                      id: string;
                      candidateId: string;
                      whatsappMessageId: string;
                      message: string;
                    };
                  };
                } = await this.fetchWhatsappMessageById(msg?.message?.reactionMessage?.key?.id);
                console.log('whatsappMessageReacted:', whatsappMessageReacted);
                if (msg?.message?.reactionMessage?.text === '') {
                  textMessageToSend = 'Unreacted reaction' + msg?.message?.reactionMessage?.text + ' to ' + "'" + whatsappMessageReacted?.data?.whatsappMessage?.message + "'" || '';
                } else {
                  textMessageToSend = 'Reacted ' + msg?.message?.reactionMessage?.text + ' to ' + "'" + whatsappMessageReacted?.data?.whatsappMessage?.message + "'" || '';
                }
              }
              // await this.sock.readMessages([msg.key]);

              const baileysWhatsappIncomingObj = {
                phoneNumberFrom: '+' + msg?.key?.remoteJid?.replace('@s.whatsapp.net', ''),
                message: textMessageToSend,
                phoneNumberTo: selfPhoneNumber,
                messageTimeStamp: msg?.messageTimestamp,
                fromName: msg?.pushName,
                baileysMessageId: msg?.key?.id,
              };
              console.log("baileysWhatsappIncomingObj", baileysWhatsappIncomingObj)
              console.log("msg", msg)
              await this.downloadAllMediaFiles(msg, this.sock, msg.key.remoteJid, candidateProfileData);
              await new IncomingWhatsappMessages(this.workspaceQueryService).receiveIncomingMessagesFromBaileys(baileysWhatsappIncomingObj,apiToken);
              // console.log('baileysWhatsappIncomingObj', baileysWhatsappIncomingObj);
              this.sock?.server?.emit(event, data);
            } else {
              console.log('Message is from me:', msg.key.fromMe);
              // console.log('This is the message:', msg);
              const baileysWhatsappIncomingObj = {
                phoneNumberTo: '+' + msg?.key?.remoteJid?.replace('@s.whatsapp.net', ''),
                message: msg?.message?.conversation || msg?.message?.extendedTextMessage?.text || '',
                phoneNumberFrom: selfPhoneNumber,
                messageTimeStamp: msg?.messageTimestamp,
                fromName: msg?.pushName,
                baileysMessageId: msg?.key?.id,
              };
              await new IncomingWhatsappMessages(this.workspaceQueryService).receiveIncomingMessagesFromSelfFromBaileys(baileysWhatsappIncomingObj,apiToken);
            }
          }
        }

        if (upsert.type === 'append') {
          for (const msg of upsert.messages) {
            console.log("Append Message:", msg)
          }
        }
        }


      if (events['chats.update']) {
        // console.log('events::::', events);
        const chatUpdate = events['chats.update'];
        console.log('chats.update::', chatUpdate);
      }

      if (events['chats.upsert']) {
        // console.log('events::::', events);
        const chatUpsert = events['chats.upsert'];
        console.log('chats.upsert::', chatUpsert);
      }

      // socket.ev.on('chats.update', data => console.log('chats.update', JSON.stringify( data, undefined, 2 ), "\n====================================================" ) );
      // socket.ev.on('chats.upsert', data => console.log('chats.upsert', JSON.stringify( data, undefined, 2 ), "\n====================================================" ) );


    });
  }
  async fetchWhatsappMessageById(messageId: string) {
    console.log('This is the message id:', messageId);
    try {
      const whatsappMessageVariable = {
        whatsappMessageId: messageId,
      };
      const response = await axiosRequest(
        JSON.stringify({
          query: graphqlToFetchWhatsappMessageByWhatsappId,
          variables: whatsappMessageVariable,
        }),apiToken
      );
      console.log('Response from fetchWhatsappMessageById:', response?.data);
      return response?.data;
    } catch (error) {
      console.log('Error fetching whatsapp message by id:', error);
      return { error: error };
    }
  }

  async handleDeleteForEveryoneMessage(msg, candidateProfile: allDataObjects.CandidateNode) {
    // console.log('This is the message:', msg);
    console.log('This is the candidateProfile:', candidateProfile);
    const whatsappMessageToGetDeleted = await this.fetchWhatsappMessageById(msg?.message?.protocolMessage?.key?.id);
    console.log('whatsappMessageToGetDeleted:', whatsappMessageToGetDeleted);
    const messageObj = whatsappMessageToGetDeleted?.data?.whatsappMessage?.messageObj;
    console.log('messageObj:', messageObj);
    const messagesAfterDeletingTheCurrentMessage = messageObj?.slice(0, messageObj?.length - 1);
    console.log('messagesAfterDeletingTheCurrentMessage:', messagesAfterDeletingTheCurrentMessage);

    try {
      const variables = {
        limit: 1,
        filter: {
          candidateId: {
            eq: candidateProfile?.id,
          },
        },
        orderBy: [
          {
            position: 'AscNullsFirst',
          },
        ],
      };
      const responseAfterFetchingAllMessagesByCandidateId = await axiosRequest(
        JSON.stringify({
          query: graphqlToFetchWhatsappMessageByCandidateId,
          variables: variables,
        }),apiToken
      );
      const latestMessageObject: any[] = responseAfterFetchingAllMessagesByCandidateId?.data?.data?.whatsappMessages?.edges[0]?.node?.messageObj;
      console.log('latestMessageObject:', latestMessageObject);
      let updatedMessageHistoryObject: any = [];
      for (let i = latestMessageObject.length - 1; i >= 0; i--) {
        if (whatsappMessageToGetDeleted?.data?.whatsappMessage?.message !== latestMessageObject[i].content) {
          updatedMessageHistoryObject.unshift(latestMessageObject[i]);
        }
      }

      const dataToUpdate = {
        idToUpdate: responseAfterFetchingAllMessagesByCandidateId?.data?.data?.whatsappMessages?.edges[0]?.node?.id,
        input: {
          messageObj: updatedMessageHistoryObject,
        },
      };
      const response = await axiosRequest(
        JSON.stringify({
          query: graphqlToUpdateWhatsappMessageId,
          variables: dataToUpdate,
        }),apiToken
      );

      console.log('Response from updating the message:', response?.data);
    } catch (error) {
      console.log('Error updating the message', error);
    }
  }

  async downloadAllMediaFiles(m: any, socket: any, folder: any, candidateProfileData: allDataObjects.CandidateNode) {
    let messageType = '';
    try {
      messageType = Object.keys(m.message)[0];
    } catch {
      console.log('message type errored');
    }
    console.log('This si the path:', folder);
    console.log('This si the download media files path:', folder);
    console.log('This si the download media files messageType:', messageType);
    // messageType = "imageMessage","videoMessage","documentMessage"

    let message = m?.message;

    // below code let you know mimeType i.e image/jpeg, video/mp4
    // let type = m.messages[0].message.<imageMessage>.mimetype

    let ogFileName: string = ''; // Change the type of ogFileName from null to string and initialize it with an empty string
    // console.log('This is the media message:', m?.message);
    // console.log("This is the media message type:", Object.keys(m?.messages[0]?.message)[0])
    if (messageType == 'imageMessage') {
      ogFileName = `${new Date().getTime()}.jpeg`;
      folder = folder + '/images';
    } else if (messageType == 'videoMessage') {
      ogFileName = `${new Date().getTime()}.mp4`;
      folder = folder + '/videos';
    } else if (messageType == 'messageContextInfo') {
      ogFileName = message?.documentMessage?.fileName || message?.documentWithCaptionMessage?.message?.documentMessage?.fileName || `${new Date().getTime()}.pdf`;
      folder = folder + '/messageContext';
    } else if (messageType == 'documentMessage') {
      ogFileName = message.documentMessage.fileName;
      folder = folder + '/docs';
    } else {
      return false;
    }
    console.log('This is the folder path:', folder);
    console.log('This is the ogFileName ogFileName:', ogFileName);
    console.log('This is the ogFileName message?.documentWithCaptionMessage:', message?.documentWithCaptionMessage);
    console.log('This is the ogFileName message?.documentWithCaptionMessage message?.documentWithCaptionMessage?.message?.fileName:', message?.documentWithCaptionMessage?.message?.documentMessage?.fileName);
    // download the message
    try {
      if (candidateProfileData != allDataObjects.emptyCandidateProfileObj) {
        console.log("Candidate is in the database, seee")
        console.log("Candidate is in socket.updateMediaMessageseee", socket.updateMediaMessage)
        // console.log('This is the candiate who has sent us candidateProfileData::', candidateProfileData);
        const buffer = await downloadMediaMessage(m, 'buffer', {}, { logger: this.logger, reuploadRequest: socket.updateMediaMessage });
        let data: any = { fileName: ogFileName, fileBuffer: buffer };
        console.log("Got the data for upload attachemnets:", data)
        this.handleFileUpload(data, './.attachments/' + folder, candidateProfileData);
        return true;
      } else {
        console.log('Message has been received from a candidate however the candidate is not in the database');
      }
    } catch (error) {
      console.log('Error downloading media:', error);
    }
    // downloadMediaFiles(m, socket, messageType);
  }

  async handleFileUpload(file: FileDataDto, userDirectory: string, candidateProfileData): Promise<FileDataDto> {
    try {
      console.log('userDirectory:', userDirectory);
      console.log('file:', file);
      userDirectory = await this.createDirectoryIfNotExists(userDirectory);
      file.filePath = path.join(userDirectory, file.fileName);
      console.log(file.filePath);
      await fs.promises.writeFile(file.filePath, file.fileBuffer);
      const attachmentObj = await new AttachmentProcessingService().uploadAttachmentToTwenty(file.filePath,apiToken);

      const dataToUploadInAttachmentTable = {
        input: {
          authorId: candidateProfileData.jobs.recruiterId,
          name: file.fileName,
          fullPath: attachmentObj.data.uploadFile,
          type: 'TextDocument',
          candidateId: candidateProfileData.id,
        },
      };
      await new AttachmentProcessingService().createOneAttachmentFromFilePath(dataToUploadInAttachmentTable,apiToken);
      return file;
    } catch (error) {
      throw new Error(`Error handling file upload: ${error}`);
    }
  }

  async createDirectoryIfNotExists(dirPath: string, defaultDir: string = process.env.UPLOAD_DEFAULT_LOCATION || 'FileUploads'): Promise<string> {
    const filePath = path.join(`${dirPath}/`);
    try {
      // Check if directory exists
      await fs.promises.access(filePath, fs.constants.F_OK);
      return filePath;
    } catch (error) {
      // Directory doesn't exist, create it
      try {
        await fs.promises.mkdir(filePath, { recursive: true });
        return filePath;
      } catch (mkdirError) {
        throw new Error(`Error creating directory: ${mkdirError}`);
      }
    }
  }

  async sendMessageWTyping(msg: string, jid: string) {
    await this.sock.presenceSubscribe(jid);
    await delay(500);
    await this.sock.sendPresenceUpdate('composing', jid);
    await delay(1000);
    await this.sock.sendPresenceUpdate('paused', jid);
    const sendMessageResponse = await this.sock.sendMessage(jid, { text: msg });
    // console.log('sendMessageResponse in baileys service::', sendMessageResponse);
    return sendMessageResponse?.key?.id;
  }

  async sendMessageFileToBaileys(body: MessageDto) {
    const { jid, message, fileData: { filePath, mimetype, fileName } = {} as any } = body;
    console.log('file media ', { jid, message, filePath, mimetype, fileName });
    try {
      const sendMessageResponse = await this.sock.sendMessage(jid, { document: { url: filePath }, caption: message, mimetype, fileName }, { url: filePath });
      return sendMessageResponse?.key?.id;
    } catch (error) {
      console.log('baileys.sendMessage got error');
      // this.handleError(error);
    }
  }

  // async getCurrentWhatsappLoginStatus() {
  //   return this.connectionStatus;
  // }
}
