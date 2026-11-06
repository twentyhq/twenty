import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getApplicationSubAllFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/get-application-sub-all-flat-entity-maps.util';
import { type FlatAgentChatChannelRole } from 'src/engine/metadata-modules/flat-agent-chat-channel-role/types/flat-agent-chat-channel-role.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

export const buildApplicationUninstallOperations = ({
  applicationId,
  applicationUniversalIdentifier,
  fromAllFlatEntityMaps,
  shouldKeepAgentChatChannels,
}: {
  applicationId: string;
  applicationUniversalIdentifier: string;
  fromAllFlatEntityMaps: AllFlatEntityMaps;
  shouldKeepAgentChatChannels: boolean;
}): AllFlatEntityOperationRecordByMetadataName => {
  const applicationFlatEntityMaps = getApplicationSubAllFlatEntityMaps({
    applicationIds: [applicationId],
    fromAllFlatEntityMaps,
  });
  const {
    flatAgentChatChannelMaps,
    flatAgentChatChannelRoleMaps,
    flatRoleMaps,
  } = applicationFlatEntityMaps;

  const isKeptChannel = (channelUniversalIdentifier: string) => {
    const channel =
      flatAgentChatChannelMaps.byUniversalIdentifier[
        channelUniversalIdentifier
      ];

    return (
      isDefined(channel) &&
      (shouldKeepAgentChatChannels ||
        channel.retainedApplicationUniversalIdentifier ===
          applicationUniversalIdentifier)
    );
  };

  const isKeptChannelRole = ({
    channelUniversalIdentifier,
    roleUniversalIdentifier,
  }: Pick<
    FlatAgentChatChannelRole,
    'channelUniversalIdentifier' | 'roleUniversalIdentifier'
  >) =>
    shouldKeepAgentChatChannels &&
    isKeptChannel(channelUniversalIdentifier) &&
    !isDefined(flatRoleMaps.byUniversalIdentifier[roleUniversalIdentifier]);

  const operations: AllFlatEntityOperationRecordByMetadataName =
    Object.fromEntries(
      Object.values(ALL_METADATA_NAME).map((metadataName) => [
        metadataName,
        {
          flatEntityToCreate: {},
          flatEntityToUpdate: {},
          flatEntityToDelete:
            applicationFlatEntityMaps[
              getMetadataFlatEntityMapsKey(metadataName)
            ].byUniversalIdentifier,
        },
      ]),
    );

  operations.agentChatChannel = {
    flatEntityToCreate: {},
    flatEntityToUpdate: {},
    flatEntityToDelete: Object.fromEntries(
      Object.entries(flatAgentChatChannelMaps.byUniversalIdentifier).filter(
        ([universalIdentifier]) => !isKeptChannel(universalIdentifier),
      ),
    ),
  };
  operations.agentChatChannelRole = {
    flatEntityToCreate: {},
    flatEntityToUpdate: {},
    flatEntityToDelete: Object.fromEntries(
      Object.entries(flatAgentChatChannelRoleMaps.byUniversalIdentifier).filter(
        ([, channelRole]) =>
          isDefined(channelRole) && !isKeptChannelRole(channelRole),
      ),
    ),
  };

  return operations;
};
