import { DataSource } from 'typeorm';

const tableName = 'message';

export const seedMessage = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'createdAt',
      'deletedAt',
      'headerMessageId',
      'messageThreadId',
      'receivedAt',
      'subject',
      'text',
      'updatedAt',
      'direction',
    ])
    .orIgnore()
    .values([
      {
        id: '99ef24a8-2b8a-405d-8f42-e820ca921421',
        createdAt: new Date(),
        deletedAt: null,
        headerMessageId: '99ef24a8-2b8a-405d-8f42-e820ca921421',
        messageThreadId: 'f66b3db3-8bfa-453b-b99b-bc435a7d4da8',
        receivedAt: new Date(),
        subject: 'Meeting Request',
        text: 'Hello, \n I hope this email finds you well. I am writing to request a meeting. I believe it would be beneficial for both parties to collaborate and explore potential opportunities. Would you be available for a meeting sometime next week? Please let me know your availability, and I will arrange a suitable time. \n Looking forward to your response.\n Best regards',
        updatedAt: new Date(),
        direction: 'outgoing',
      },
      {
        id: '8f804a9a-04c8-4f24-93f2-764948e95014',
        createdAt: new Date(),
        deletedAt: null,
        headerMessageId: '8f804a9a-04c8-4f24-93f2-764948e95014',
        messageThreadId: 'a05c4e4c-634a-4fde-aa7c-28a0eaf203ca',
        receivedAt: new Date(),
        subject: 'Inquiry Regarding Topic',
        text: 'Good Morning,\n I am writing to inquire about information. Could you please provide me with details regarding this topic? \n Your assistance in this matter would be greatly appreciated. Thank you in advance for your prompt response. \n Best regards,Tim',
        updatedAt: new Date(),
        direction: 'outgoing',
      },
      {
        id: '3939d68a-ac6b-4f86-87a2-5f5f9d1b6481',
        createdAt: new Date(),
        deletedAt: null,
        headerMessageId: '3939d68a-ac6b-4f86-87a2-5f5f9d1b6481',
        messageThreadId: 'f66b3db3-8bfa-453b-b99b-bc435a7d4da8',
        receivedAt: new Date(),
        subject: 'Thank You for the Meeting',
        text: 'Good Evening,\nI wanted to extend my sincere gratitude for taking the time to meet with me earlier today. It was a pleasure discussing with you, and I am excited about the potential opportunities for collaboration. \n Please feel free to reach out if you have any further questions or require additional information. I look forward to our continued communication. Best regards.',
        updatedAt: new Date(),
        direction: 'incoming',
      },
    ])
    .execute();
};
