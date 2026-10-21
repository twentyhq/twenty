import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { isDefined } from 'twenty-shared/utils';

type BuildWidgetVisibilityContextParams = {
  isMobile: boolean;
  isInSidePanel: boolean;
  targetRecord?: Record<string, unknown>;
  featureFlags?: Record<string, boolean>;
  currentRoleId?: string | null;
  currentWorkspaceMemberId?: string | null;
  objectMetadataItem?: EnrichedObjectMetadataItem;
  objectMetadataItems?: EnrichedObjectMetadataItem[];
};

export const buildWidgetVisibilityContext = ({
  isMobile,
  isInSidePanel,
  targetRecord,
  featureFlags,
  currentRoleId,
  currentWorkspaceMemberId,
  objectMetadataItem,
  objectMetadataItems,
}: BuildWidgetVisibilityContextParams): WidgetVisibilityContext => {
  return {
    device: isMobile || isInSidePanel ? 'MOBILE' : 'DESKTOP',
    // Plural to share the command menu grammar; empty when absent so record-gated widgets stay hidden until load.
    selectedRecords: isDefined(targetRecord) ? [targetRecord] : [],
    featureFlags: featureFlags ?? {},
    currentRoleId: currentRoleId ?? null,
    currentWorkspaceMemberId: currentWorkspaceMemberId ?? null,
    objectMetadataItem,
    objectMetadataItems: objectMetadataItems ?? [],
  };
};
