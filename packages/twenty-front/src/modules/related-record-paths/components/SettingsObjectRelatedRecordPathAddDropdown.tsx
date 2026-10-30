import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsObjectRelatedRecordPathPicker } from '@/related-record-paths/components/SettingsObjectRelatedRecordPathPicker';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type SettingsObjectRelatedRecordPathAddDropdownProps = {
  sourceObjectMetadataItem: EnrichedObjectMetadataItem;
  disabled: boolean;
  onSubmit: (fieldMetadataIds: string[]) => void;
};

export const SettingsObjectRelatedRecordPathAddDropdown = ({
  sourceObjectMetadataItem,
  disabled,
  onSubmit,
}: SettingsObjectRelatedRecordPathAddDropdownProps) => {
  const { t } = useLingui();
  const [fieldMetadataIds, setFieldMetadataIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');

  return (
    <DropdownRoot
      dropdownId={`related-record-path-add-${sourceObjectMetadataItem.id}`}
      type="picker"
      onOpenChange={(open) => {
        if (open) {
          setFieldMetadataIds([]);
          setSearchInput('');
        }
      }}
    >
      <Dropdown.Trigger
        disabled={disabled}
        render={
          <Button startIcon={<IconPlus />} size="sm" variant="outline">
            {t`Add path`}
          </Button>
        }
      />
      <DropdownContent
        align="end"
        sideOffset={4}
        width={GenericDropdownContentWidth.ExtraLarge}
      >
        <SettingsObjectRelatedRecordPathPicker
          sourceObjectMetadataItem={sourceObjectMetadataItem}
          fieldMetadataIds={fieldMetadataIds}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onFieldMetadataIdsChange={setFieldMetadataIds}
          onSubmit={onSubmit}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
