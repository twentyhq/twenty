import { InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

import axios from 'axios';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { Agent } from 'src/engine/core-modules/agent/agent.entity';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { FirebaseService } from 'src/engine/core-modules/meta/services/firebase.service';
import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';
import {
  SendMessageInput,
  SendTemplateInput,
} from 'src/engine/core-modules/meta/whatsapp/dtos/send-message.input';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
import { WhatsappDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { WhatsappTemplatesResponse } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappTemplate';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export class WhatsappService {
  private META_API_URL = this.environmentService.get('META_API_URL');
  private firestoreDb: Firestore;

  constructor(
    @InjectRepository(WhatsappIntegration, 'core')
    private whatsappIntegrationRepository: Repository<WhatsappIntegration>,
    private readonly environmentService: TwentyConfigService,
    private readonly googleStorageService: GoogleStorageService,
    @InjectRepository(Sector, 'core')
    private sectorRepository: Repository<Sector>,
    @InjectRepository(Agent, 'core')
    private agentRepository: Repository<Agent>,
    private readonly firebaseService: FirebaseService,
  ) {
    this.firestoreDb = this.firebaseService.getFirestoreDb();
  }

  async sendTemplate(sendTemplateInput: SendTemplateInput) {
    const { integrationId, to, templateName, language } = sendTemplateInput;

    const integration = await this.whatsappIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new InternalServerError('Whatsapp integration not found');
    }

    const fields: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
      },
    };

    const url = `${this.META_API_URL}/${integration.phoneId}/messages`;
    const headers = {
      Authorization: `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      await axios.post(url, fields, { headers });

      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send template message',
        error.message,
      );
    }
  }

  async sendMessage(sendMessageInput: SendMessageInput) {
    const { integrationId, to, type, message, fileId } = sendMessageInput;

    const integration = await this.whatsappIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new InternalServerError('Whatsapp integration not found');
    }

    const fields: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: type,
    };

    const commonFields = {
      link: fileId,
      caption: message || '',
    };

    switch (type) {
      case 'text':
        fields.text = {
          preview_url: true,
          body: message || '',
        };
        break;
      case 'audio':
        fields.audio = {
          link: fileId,
        };
        break;
      case 'document':
        fields.document = commonFields;
        break;
      case 'image':
        fields.image = commonFields;
        break;
      case 'video':
        fields.video = commonFields;
        break;
      default:
        throw new InternalServerError('Invalid message type');
    }

    const url = `${this.META_API_URL}/${integration.phoneId}/messages`;

    const headers = {
      Authorization: `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      await axios.post(url, fields, { headers });

      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send message',
        error.message,
      );
    }
  }

  async getWhatsappTemplates(
    integrationId: string,
  ): Promise<WhatsappTemplatesResponse> {
    if (!integrationId) {
      // eslint-disable-next-line no-console
      console.error('Whatsapp integration id not found');

      return { templates: [] };
    }

    const integration = await this.whatsappIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new InternalServerError('Whatsapp integration not found');
    }

    const url = `${this.META_API_URL}/${integration?.businessAccountId}/message_templates`;

    const headers = {
      Authorization: `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
    };

    let allTemplates = [];

    try {
      const response = await axios.get(url, { headers });

      const { data } = response.data;

      allTemplates = data.filter(
        (template: any) => template.status === 'APPROVED',
      );

      return { templates: allTemplates };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get Business ID ${integration?.businessAccountId} templates`,
        error.message,
      );
    }
  }

  async sendNotification(externalIds: string[], message: string) {
    const ONESIGNAL_APPID = this.environmentService.get('ONESIGNAL_APP_ID');

    const ONESIGNAL_REST_API_KEY = this.environmentService.get(
      'ONESIGNAL_REST_API_KEY',
    );

    const headers = {
      Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    };

    try {
      const body = {
        app_id: ONESIGNAL_APPID,
        include_aliases: {
          external_id: externalIds,
        },
        target_channel: 'push',
        isAnyWeb: true,
        headings: {
          en: message,
        },
        contents: {
          en: message,
        },
      };

      await axios.post('https://onesignal.com/api/v1/notifications', body, {
        headers,
      });

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('ERROR', error.response?.data || error.message);

      return false;
    }
  }

  async saveMessageAtFirebase(
    whatsappDoc: Omit<
      WhatsappDocument,
      'timeline' | 'unreadMessages' | 'isVisible'
    >,
    isReceiving: boolean,
  ) {
    const messagesCollection = collection(this.firestoreDb, 'whatsapp');
    const docId = `${whatsappDoc.integrationId}_${whatsappDoc.client.phone}`;
    const docRef = doc(messagesCollection, docId);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      await setDoc(docRef, {
        ...whatsappDoc,
        timeline: [],
        agent: 'empty',
        sector: 'empty',
        unreadMessages: isReceiving ? 1 : 0,
        isVisible: true,
      });

      if (isReceiving) {
        const whatsappIntegrationWithWorkspace =
          await this.whatsappIntegrationRepository.findOne({
            relations: ['workspace'],
            where: {
              id: whatsappDoc.integrationId,
            },
          });

        const sectorsFromWorkspace = await this.sectorRepository.find({
          relations: ['agents'],
          where: {
            workspace: {
              id: whatsappIntegrationWithWorkspace?.workspace.id,
            },
          },
        });

        if (!sectorsFromWorkspace) {
          return true;
        }

        //   await this.sendNotification(
        //     sectorsFromWorkspace.flatMap((sector) =>
        //       sector.agents.map((agent) => agent.memberId),
        //     ),
        //     `${whatsappDoc.client.name}: ${whatsappDoc.messages[0].message}`,
        //   );
      }

      return true;
    }

    if (docSnapshot.exists()) {
      const whatsappIntegration = docSnapshot.data() as WhatsappDocument;

      if (whatsappIntegration.status === statusEnum.Resolved) {
        whatsappIntegration.status = statusEnum.Waiting;
        whatsappIntegration.agent = 'empty';
        whatsappIntegration.sector = 'empty';
        whatsappIntegration.isVisible = true;
      }

      whatsappIntegration.messages.push({ ...whatsappDoc.messages[0] });
      whatsappIntegration.lastMessage = { ...whatsappDoc.lastMessage };
      whatsappIntegration.unreadMessages = isReceiving
        ? whatsappIntegration.unreadMessages + 1
        : 0;

      await setDoc(docRef, whatsappIntegration);

      if (isReceiving) {
        if (whatsappIntegration.agent != 'empty') {
          const agent = await this.agentRepository.findOne({
            where: { id: whatsappIntegration.agent },
          });

          if (!agent) {
            return true;
          }

          await this.sendNotification(
            [agent.memberId],
            `${whatsappIntegration.client.name}: ${whatsappDoc.messages[0].message}`,
          );
        }

        if (whatsappIntegration.sector != 'empty') {
          const sector = await this.sectorRepository.findOne({
            relations: ['workspace', 'agents'],
            where: {
              id: whatsappIntegration.sector,
            },
          });

          if (!sector) {
            return true;
          }

          //     await this.sendNotification(
          //       sector.agents.map((agent) => agent.memberId),
          //       `${whatsappIntegration.client.name}: ${whatsappDoc.messages[0].message}`,
          //     );
        }
      }

      return true;
    }

    return false;
  }

  async saveEventMessageAtFirebase(
    whatsappDoc: Omit<
      WhatsappDocument,
      'unreadMessages' | 'lastMessage' | 'isVisible'
    >,
  ) {
    const messagesCollection = collection(this.firestoreDb, 'whatsapp');
    const docId = `${whatsappDoc.integrationId}_${whatsappDoc.client.phone}`;
    const docRef = doc(messagesCollection, docId);
    const docSnapshot = await getDoc(docRef);

    const whatsappIntegration = docSnapshot.data() as WhatsappDocument;

    whatsappIntegration.messages.push({ ...whatsappDoc.messages[0] });
    whatsappIntegration.timeline.push({ ...whatsappDoc.timeline[0] });
    whatsappIntegration.status = whatsappDoc.status;
    whatsappIntegration.agent = whatsappDoc.agent;
    whatsappIntegration.sector = whatsappDoc.sector;

    await setDoc(docRef, whatsappIntegration);

    return true;
  }

  async downloadMedia(
    mediaId: string,
    integrationId: string,
    phoneNumber: string,
    type: string,
  ) {
    const integration = await this.whatsappIntegrationRepository.findOne({
      where: { id: integrationId },
      relations: ['workspace'],
    });

    if (!integration) {
      // eslint-disable-next-line no-console
      console.error('Integration not found for integrationId:', integrationId);

      return;
    }

    const url = `${this.META_API_URL}/${mediaId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${integration?.accessToken}`,
        },
      });

      const data = response.data;

      if (!data) {
        throw new Error('Media URL not found.');
      }

      data.url = data.url.replace(/\\/g, '');
      data.mime_type = data.mime_type.replace(/\\/g, '');

      const mediaResponse = await axios.get(data.url, {
        headers: {
          Authorization: `Bearer ${integration?.accessToken}`,
        },
        responseType: 'arraybuffer',
      });

      const mediaBuffer = Buffer.from(mediaResponse.data, 'binary');

      const file: { originalname: string; buffer: Buffer; mimetype: string } = {
        originalname: `${phoneNumber}_${v4()}`,
        buffer: mediaBuffer,
        mimetype: data.mime_type,
      };

      const fileUrl = await this.googleStorageService.uploadFileToBucket(
        integration.workspace.id,
        type,
        file,
        false,
      );

      return fileUrl;
    } catch (error) {
      const err = `Error downloading media: ${error.message}`;

      throw new Error(err);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleChatsWaitingStatus() {
    const chatsQuery = query(
      collection(this.firestoreDb, 'whatsapp'),
      where('status', '==', statusEnum.InProgress),
    );

    const snapshot = await getDocs(chatsQuery);

    snapshot.forEach(async (docSnapshot) => {
      const waDoc = docSnapshot.data() as WhatsappDocument;

      if (waDoc.lastMessage.from === 'system') return;

      const waCreatedAt = waDoc.lastMessage.createdAt;

      const now = new Date();

      if (waCreatedAt instanceof Timestamp) {
        const createdAtDate = waCreatedAt.toDate().getTime();
        const timeDifference = (now.getTime() - createdAtDate) / 1000 / 60;

        const integration = await this.whatsappIntegrationRepository.findOne({
          where: { id: waDoc.integrationId },
        });

        if (!integration) {
          // eslint-disable-next-line no-console
          console.error(
            'Integration not found for integrationId:',
            waDoc.integrationId,
          );

          return;
        }

        if (timeDifference >= integration.sla && waDoc.agent !== 'empty') {
          const docRef = doc(this.firestoreDb, 'whatsapp', docSnapshot.id);

          await setDoc(docRef, {
            ...waDoc,
            agent: 'empty',
            status: statusEnum.Pending,
          });
        }
      } else {
        // eslint-disable-next-line no-console
        console.error('createdAt is not a valid Timestamp');
      }
    });
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleResolvedChatsVisibility() {
    const chatsQuery = query(
      collection(this.firestoreDb, 'whatsapp'),
      where('status', '==', statusEnum.Resolved),
      where('isVisible', '==', true),
    );

    const snapshot = await getDocs(chatsQuery);

    snapshot.forEach(async (docSnapshot) => {
      const waDoc = docSnapshot.data() as WhatsappDocument;
      const waCreatedAt = waDoc.lastMessage.createdAt;

      const now = new Date();

      if (waCreatedAt instanceof Timestamp) {
        const createdAtDate = waCreatedAt.toDate().getTime();
        const timeDifference = (now.getTime() - createdAtDate) / 1000 / 60;

        if (timeDifference >= 1440) {
          const docRef = doc(this.firestoreDb, 'whatsapp', docSnapshot.id);

          await setDoc(docRef, {
            ...waDoc,
            isVisible: false,
          });
        }
      } else {
        // eslint-disable-next-line no-console
        console.error('createdAt is not a valid Timestamp');
      }
    });
  }
}
