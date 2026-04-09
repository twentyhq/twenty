import { styled } from '@linaria/react';

import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export interface EventRowDynamicComponentProps {
  labelIdentifierValue: string;
  event: TimelineActivity;
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  linkedObjectMetadataItem: EnrichedObjectMetadataItem | null;
  authorFullName: string;
  createdAt?: string;
}

export const StyledEventRowItemColumn = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
`;

export const StyledEventRowItemAction = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
`;
