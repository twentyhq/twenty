import { useContext } from 'react';
import styled from '@emotion/styled';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldDisplay } from '@/object-record/field/components/FieldDisplay';
import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { FieldRelationMetadata } from '@/object-record/field/types/FieldMetadata';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import { CardContent } from '@/ui/layout/card/components/CardContent';

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  padding: ${({ theme }) => theme.spacing(0, 2, 0, 3)};
`;

type RecordRelationFieldCardContentProps = {
  divider?: boolean;
  relationRecordId: string;
};

export const RecordRelationFieldCardContent = ({
  divider,
  relationRecordId,
}: RecordRelationFieldCardContentProps) => {
  const { fieldDefinition } = useContext(FieldContext);
  const { relationObjectMetadataNameSingular } =
    fieldDefinition.metadata as FieldRelationMetadata;
  const { labelIdentifierFieldMetadata: relationLabelIdentifierFieldMetadata } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const { FieldContextProvider } = useFieldContext({
    fieldMetadataName: relationLabelIdentifierFieldMetadata?.name || '',
    fieldPosition: 0,
    isLabelIdentifier: true,
    objectNameSingular: relationObjectMetadataNameSingular,
    objectRecordId: relationRecordId,
  });

  if (!FieldContextProvider) return null;

  return (
    <StyledCardContent divider={divider}>
      <FieldContextProvider>
        <FieldDisplay />
      </FieldContextProvider>
    </StyledCardContent>
  );
};
