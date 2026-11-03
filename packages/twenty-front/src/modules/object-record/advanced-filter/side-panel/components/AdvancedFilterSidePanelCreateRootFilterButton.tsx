import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useAddRootRecordFilterGroup } from '@/object-record/advanced-filter/hooks/useAddRootRecordFilterGroup';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconFilter } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

export const AdvancedFilterSidePanelCreateRootFilterButton = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: EnrichedObjectMetadataItem;
}) => {
  const { readonly, fieldSelectLeadingSections } = useContext(
    AdvancedFilterContext,
  );

  const { addRootRecordFilterGroup } = useAddRootRecordFilterGroup({
    objectMetadataItem,
    fieldSelectLeadingSections,
  });

  return (
    <Button
      startIcon={<IconFilter />}
      size="sm"
      onClick={addRootRecordFilterGroup}
      aria-label={t`Add filter`}
      disabled={readonly}
      variant="outline"
    >{t`Add filter`}</Button>
  );
};
