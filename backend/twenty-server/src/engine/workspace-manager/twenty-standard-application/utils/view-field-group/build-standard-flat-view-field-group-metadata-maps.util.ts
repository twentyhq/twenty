import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { computeStandardBlocklistViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-blocklist-view-field-groups.util';
import { computeStandardCalendarChannelViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-calendar-channel-view-field-groups.util';
import { computeStandardCalendarChannelEventAssociationViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-calendar-channel-event-association-view-field-groups.util';
import { computeStandardCalendarEventParticipantViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-calendar-event-participant-view-field-groups.util';
import { computeStandardCompanyViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-company-view-field-groups.util';
import { computeStandardConnectedAccountViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-connected-account-view-field-groups.util';
import { computeStandardFavoriteViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-favorite-view-field-groups.util';
import { computeStandardFavoriteFolderViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-favorite-folder-view-field-groups.util';
import { computeStandardMessageChannelViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-message-channel-view-field-groups.util';
import { computeStandardMessageChannelMessageAssociationViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-message-channel-message-association-view-field-groups.util';
import { computeStandardMessageChannelMessageAssociationMessageFolderViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-message-channel-message-association-message-folder-view-field-groups.util';
import { computeStandardMessageFolderViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-message-folder-view-field-groups.util';
import { computeStandardMessageParticipantViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-message-participant-view-field-groups.util';
import { computeStandardNoteViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-note-view-field-groups.util';
import { computeStandardOpportunityViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-opportunity-view-field-groups.util';
import { computeStandardPersonViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-person-view-field-groups.util';
import { computeStandardTaskViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-task-view-field-groups.util';
import { computeStandardWorkflowAutomatedTriggerViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-workflow-automated-trigger-view-field-groups.util';
import { computeStandardWorkflowRunViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-workflow-run-view-field-groups.util';
import { computeStandardWorkflowVersionViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-workflow-version-view-field-groups.util';
import { type CreateStandardViewFieldGroupArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

type StandardViewFieldGroupBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardViewFieldGroupArgs<P>, 'context'>,
) => Record<string, FlatViewFieldGroup>;

const STANDARD_FLAT_VIEW_FIELD_GROUP_METADATA_BUILDERS_BY_OBJECT_NAME = {
  blocklist: computeStandardBlocklistViewFieldGroups,
  calendarChannel: computeStandardCalendarChannelViewFieldGroups,
  calendarChannelEventAssociation:
    computeStandardCalendarChannelEventAssociationViewFieldGroups,
  calendarEventParticipant:
    computeStandardCalendarEventParticipantViewFieldGroups,
  company: computeStandardCompanyViewFieldGroups,
  connectedAccount: computeStandardConnectedAccountViewFieldGroups,
  favorite: computeStandardFavoriteViewFieldGroups,
  favoriteFolder: computeStandardFavoriteFolderViewFieldGroups,
  messageChannel: computeStandardMessageChannelViewFieldGroups,
  messageChannelMessageAssociation:
    computeStandardMessageChannelMessageAssociationViewFieldGroups,
  messageChannelMessageAssociationMessageFolder:
    computeStandardMessageChannelMessageAssociationMessageFolderViewFieldGroups,
  messageFolder: computeStandardMessageFolderViewFieldGroups,
  messageParticipant: computeStandardMessageParticipantViewFieldGroups,
  note: computeStandardNoteViewFieldGroups,
  opportunity: computeStandardOpportunityViewFieldGroups,
  person: computeStandardPersonViewFieldGroups,
  task: computeStandardTaskViewFieldGroups,
  workflowAutomatedTrigger:
    computeStandardWorkflowAutomatedTriggerViewFieldGroups,
  workflowRun: computeStandardWorkflowRunViewFieldGroups,
  workflowVersion: computeStandardWorkflowVersionViewFieldGroups,
} as const satisfies {
  [P in AllStandardObjectName]?: StandardViewFieldGroupBuilder<P>;
};

export type BuildStandardFlatViewFieldGroupMetadataMapsArgs = Omit<
  CreateStandardViewFieldGroupArgs,
  'context' | 'objectName'
> & {
  shouldIncludeRecordPageLayouts?: boolean;
};

export const buildStandardFlatViewFieldGroupMetadataMaps = ({
  shouldIncludeRecordPageLayouts,
  ...args
}: BuildStandardFlatViewFieldGroupMetadataMapsArgs): FlatEntityMaps<FlatViewFieldGroup> => {
  if (!shouldIncludeRecordPageLayouts) {
    return createEmptyFlatEntityMaps();
  }

  const allViewFieldGroupMetadatas: FlatViewFieldGroup[] = (
    Object.keys(
      STANDARD_FLAT_VIEW_FIELD_GROUP_METADATA_BUILDERS_BY_OBJECT_NAME,
    ) as (keyof typeof STANDARD_FLAT_VIEW_FIELD_GROUP_METADATA_BUILDERS_BY_OBJECT_NAME)[]
  ).flatMap((objectName) => {
    const builder: StandardViewFieldGroupBuilder<typeof objectName> =
      STANDARD_FLAT_VIEW_FIELD_GROUP_METADATA_BUILDERS_BY_OBJECT_NAME[
        objectName
      ];

    const result = builder({
      ...args,
      objectName,
    });

    return Object.values(result);
  });

  let flatViewFieldGroupMaps = createEmptyFlatEntityMaps();

  for (const viewFieldGroupMetadata of allViewFieldGroupMetadatas) {
    flatViewFieldGroupMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: viewFieldGroupMetadata,
      flatEntityMaps: flatViewFieldGroupMaps,
    });
  }

  return flatViewFieldGroupMaps;
};
