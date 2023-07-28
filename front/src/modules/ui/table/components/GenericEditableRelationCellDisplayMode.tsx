import { useRecoilValue } from 'recoil';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';
import { EntityFieldMetadata } from '@/ui/table/types/EntityFieldMetadata';
import { getLogoUrlFromDomainName } from '~/utils';

type OwnProps = {
  fieldMetadata: EntityFieldMetadata;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export function GenericEditableRelationCellDisplayMode({
  fieldMetadata,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<any | null>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: fieldMetadata.fieldName,
    }),
  );

  switch (fieldMetadata.relationType) {
    case Entity.Company: {
      return (
        <CompanyChip
          id={fieldValue?.id ?? ''}
          name={fieldValue?.name ?? ''}
          pictureUrl={getLogoUrlFromDomainName(fieldValue?.domainName)}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${fieldMetadata.relationType}" in GenericEditableRelationCellEditMode`,
      );
      return <> </>;
  }
}
