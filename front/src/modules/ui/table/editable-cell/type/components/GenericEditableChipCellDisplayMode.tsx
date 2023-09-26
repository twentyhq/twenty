import { useRecoilValue } from 'recoil';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldChipMetadata } from '@/ui/field/types/FieldMetadata';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { getLogoUrlFromDomainName } from '~/utils';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  viewFieldDefinition: ColumnDefinition<FieldChipMetadata>;
};

export const GenericEditableChipCellDisplayMode = ({
  viewFieldDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const content = useRecoilValue<any | null>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.contentFieldName,
    }),
  );

  const chipUrl = useRecoilValue<any | null>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.urlFieldName,
    }),
  );

  switch (viewFieldDefinition.metadata.relationType) {
    case Entity.Company: {
      return (
        <CompanyChip
          id={currentRowEntityId ?? ''}
          name={content ?? ''}
          pictureUrl={getLogoUrlFromDomainName(chipUrl)}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${viewFieldDefinition.metadata.relationType}" in GenericEditableChipCellEditMode`,
      );
      return <> </>;
  }
};
