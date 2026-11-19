import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

type ConditionalAvailabilityEditorPageProps = {
  objectMetadataId: string | null | undefined;
  children: (
    objectMetadataItem: EnrichedObjectMetadataItem | null,
  ) => ReactNode;
};

export const ConditionalAvailabilityEditorPage = ({
  objectMetadataId,
  children,
}: ConditionalAvailabilityEditorPageProps) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const objectMetadataItem =
    objectMetadataItems.find(
      (candidate) => candidate.id === objectMetadataId,
    ) ?? null;

  return <StyledContainer>{children(objectMetadataItem)}</StyledContainer>;
};
