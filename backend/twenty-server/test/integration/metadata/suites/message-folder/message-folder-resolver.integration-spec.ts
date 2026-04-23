import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-channel-data-seeds.constant';
import { MESSAGE_FOLDER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-folder-data-seeds.constant';

describe('messageFolderResolver (e2e)', () => {
  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
      value: true,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
      value: false,
      expectToFail: false,
    });
  });

  describe('myMessageFolders', () => {
    it('should return only the current user message folders', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyMessageFolders {
            myMessageFolders {
              id
              name
              isSynced
              messageChannelId
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const folders = response.body.data.myMessageFolders;
      const folderIds = folders.map((folder: { id: string }) => folder.id);

      expect(folderIds).toContain(MESSAGE_FOLDER_DATA_SEED_IDS.JANE_INBOX);
      expect(folderIds).toContain(MESSAGE_FOLDER_DATA_SEED_IDS.JANE_SENT);
      expect(folderIds).not.toContain(
        MESSAGE_FOLDER_DATA_SEED_IDS.JONY_INBOX,
      );
    });

    it('should filter by messageChannelId', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyMessageFolders($messageChannelId: UUID) {
            myMessageFolders(messageChannelId: $messageChannelId) {
              id
              name
            }
          }
        `,
        variables: {
          messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JANE,
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const folders = response.body.data.myMessageFolders;
      const folderIds = folders.map((folder: { id: string }) => folder.id);

      expect(folderIds).toContain(MESSAGE_FOLDER_DATA_SEED_IDS.JANE_INBOX);
      expect(folderIds).not.toContain(
        MESSAGE_FOLDER_DATA_SEED_IDS.JONY_INBOX,
      );
    });

    it('should deny filtering by another user messageChannelId', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyMessageFolders($messageChannelId: UUID) {
            myMessageFolders(messageChannelId: $messageChannelId) {
              id
            }
          }
        `,
        variables: {
          messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });

    it('should not expose hidden fields', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyMessageFolders {
            myMessageFolders {
              id
              syncCursor
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('updateMessageFolder', () => {
    it('should allow updating own folder isSynced', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation UpdateMessageFolder($input: UpdateMessageFolderInput!) {
            updateMessageFolder(input: $input) {
              id
              isSynced
            }
          }
        `,
        variables: {
          input: {
            id: MESSAGE_FOLDER_DATA_SEED_IDS.JANE_INBOX,
            update: { isSynced: false },
          },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateMessageFolder.isSynced).toBe(false);
    });

    it('should deny updating another user folder', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation UpdateMessageFolder($input: UpdateMessageFolderInput!) {
            updateMessageFolder(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: MESSAGE_FOLDER_DATA_SEED_IDS.JONY_INBOX,
            update: { isSynced: false },
          },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });
  });
});
