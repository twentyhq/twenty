import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import axios from 'axios';
import * as fs from 'fs';
import { WhatsappService } from '../whiskeysocket-baileys.service';
import { axiosRequest } from '../../arx-chat/utils/arx-chat-agent-utils';
import { FindManyWorkspaceMembers } from '../graphql-queries';
import { MessageDto } from '../types/baileys-types';
import { Workspace } from '../../workspace/workspace.entity';
import { WorkspaceQueryService } from '../../workspace-modifications/workspace-modifications.service';

const apiToken = process.env.TWENTY_JWT_SECRET || '';


@WebSocketGateway({
  cors: {
    origin: '*', // Adjust the CORS settings according to your needs
  },
  path: process.env.SOCKET_PATH,
})
export class EventsGateway implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
  @WebSocketServer() server: Server;

  private _isWhatsappLoggedIn: boolean;
  private _workspaceMemberId: string;
  private whatsappServices: Map<string, WhatsappService> = new Map();
  private workspaceQueryService: WorkspaceQueryService;

  constructor(workspaceQueryService: WorkspaceQueryService) {
    this.workspaceQueryService = workspaceQueryService;
    this.loadSessionIds();
  }

  public get getWorkspaceMemberId() {
    return this._workspaceMemberId;
  }

  set isWhatsappLoggedIn(value: boolean) {
    this._isWhatsappLoggedIn = value;
    // this.emitEvent('isWhatsappLoggedIn', this._isWhatsappLoggedIn);
  }

  async handleConnection(client: Socket) {
    const user = client?.handshake?.auth?.user;
    console.log('Client connected:', client.id);
    const socketClientId = client?.id;
    console.log('socketClientId:', socketClientId);
    console.log('query token:', client?.handshake?.query?.token);

    // const { workspaceMemberId, workspaceId } = await new SocketVerifyAuth.socketVerifyAuthVerify((client?.handshake?.query?.token as string) || '');
    try {
      const headers = {
        Authorization: `Bearer ${client?.handshake?.query?.token}`,
      };
      const response = await axios.get('http://localhost:3000/socket-auth/verify', { headers });

      console.log('UserId connected:', response?.data);
      const workspaceUserId = response?.data;
      const graphqlVariableToFilterWorkspaceMember = { filter: { userId: { eq: workspaceUserId, }, }, };
      let responseAfterQueryingWorkspaceMember;
      try {
        responseAfterQueryingWorkspaceMember = await axiosRequest(
          JSON.stringify({
            query: FindManyWorkspaceMembers,
            variables: graphqlVariableToFilterWorkspaceMember,
          }),apiToken

        );

        console.log('response:', response?.data);
      } catch (error) {
        console.error('Error querying workspace member:', error);
      }
      const workspaceMemberId = responseAfterQueryingWorkspaceMember?.data?.data?.workspaceMembers?.edges[0]?.node?.id;
      console.log('responseAfterQueryingWorkspaceMember:', workspaceMemberId);
      const sessionId = workspaceMemberId;

      if (!this.whatsappServices.has(sessionId)) {
        const whatsappService = new WhatsappService(this.workspaceQueryService, this, sessionId, socketClientId);
        this.whatsappServices.set(sessionId, whatsappService);
        this.saveSessionId(sessionId);
      } else {
        console.log('342323::', socketClientId);
        //@ts-ignore
        this.whatsappServices.get(sessionId).setSocketClientId(socketClientId);
        this.whatsappServices.get(sessionId)?.sendConnectionUpdate();
        this.emitEventTo('qr', this.whatsappServices.get(sessionId)?.whatsappLoginQrString, socketClientId);
      }

      // this._workspaceMemberId = response?.data;
      // client.emit('isWhatsappLoggedIn', this.isWhatsappLoggedIn);
    } catch (error) {
      console.error('Error verifying access token:', error);
      client.disconnect();
    }
    // console.log('isWhatsappLoggedIn:', this.isWhatsappLoggedIn);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  emitEventTo(event: string, data: any, socketClientId: string) {
    this?.server?.to(socketClientId).emit(event, data);
  }

  private saveSessionId(sessionId: string) {
    const filePath = './sessionIds.json';
    let sessionIds = [];
    if (fs.existsSync(filePath)) {
      sessionIds = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    //@ts-ignore
    if (!sessionIds.includes(sessionId)) {
      //@ts-ignore
      sessionIds.push(sessionId);
      fs.writeFileSync(filePath, JSON.stringify(sessionIds));
    }
  }

  private loadSessionIds() {
    const filePath = './sessionIds.json';
    if (fs.existsSync(filePath)) {
      const sessionIds = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log("Loaded sessionIds:", sessionIds);
      sessionIds.forEach((sessionId: string) => {
        const whatsappService = new WhatsappService(this.workspaceQueryService, this, sessionId, '');
        this.whatsappServices.set(sessionId, whatsappService);
      });
    }
    else{
      console.log("Session IDs file not found")
    }
  }

  async sendWhatsappMessage(message: string, jid: string, sessionId: string) {
    try {
      console.log('Got to sendWhatsappMssage in Events Gateway');
      console.log('sessionId:', sessionId);
      console.log('jid:', jid);
      console.log('message:', message);
      const messageId: string = await this.whatsappServices.get(sessionId)?.sendMessageWTyping(message, jid);
      return messageId;
    } catch (error) {
      console.error('Error sending message:', error);
      return "failed";

    }
  }

  async sendWhatsappFile(payload: { recruiterId: string; fileToSendData: MessageDto }) {
    const messageId: string = await this.whatsappServices.get(payload?.recruiterId)?.sendMessageFileToBaileys(payload?.fileToSendData);
    return messageId
  }
  
  
  async receiveMessages(payload: { recruiterId: string; fileToSendData: MessageDto }) {
    const messageId: string = await this.whatsappServices.get(payload?.recruiterId)?.sendMessageFileToBaileys(payload?.fileToSendData);
    return messageId
  }
}
