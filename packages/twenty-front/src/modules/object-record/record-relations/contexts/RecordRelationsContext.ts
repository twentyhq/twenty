// SOURCING: twentyhq/twenty RecordListContext (PR #23829) — fork-local RELATIONS view
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectPermission } from '~/generated-metadata/graphql';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordRelationsContextValue = {
  viewBarInstanceId: string;
  objectNameSingular: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectPermissions: ObjectPermission;
};

export const [
  RecordRelationsContextProvider,
  useRecordRelationsContextOrThrow,
] = createRequiredContext<RecordRelationsContextValue>(
  'RecordRelationsContext',
);
