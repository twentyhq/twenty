import { useRecoilValue } from 'recoil';

import { CompanyChip } from '@/companies/components/CompanyChip';
import type { ViewFieldChipMetadata } from '@/ui/editable-field/types/ViewField';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { getLogoUrlFromDomainName } from '~/utils';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldChipMetadata>;
};

export function GenericEditableChipCellDisplayMode({
  columnDefinition,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const content = useRecoilValue<any | null>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.contentFieldName,
    }),
  );

  const chipUrl = useRecoilValue<any | null>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.urlFieldName,
    }),
  );

  switch (columnDefinition.metadata.relationType) {
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
        `Unknown relation type: "${columnDefinition.metadata.relationType}" in GenericEditableChipCellEditMode`,
      );
      return <> </>;
  }
}
