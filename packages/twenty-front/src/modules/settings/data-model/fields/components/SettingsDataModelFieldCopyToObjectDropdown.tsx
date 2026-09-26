import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconCopy } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

type SettingsDataModelFieldCopyToObjectDropdownProps = {
  fieldMetadataItem: Pick<FieldMetadataItem, 'id' | 'type'>;
  sourceObjectMetadataId: string;
};

export const SettingsDataModelFieldCopyToObjectDropdown = ({
  fieldMetadataItem,
  sourceObjectMetadataId,
}: SettingsDataModelFieldCopyToObjectDropdownProps) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const [searchFilter, setSearchFilter] = useState('');

  const { alphaSortedActiveNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const normalizedSearchFilter = normalizeSearchText(searchFilter);

  const targetObjectMetadataItems =
    alphaSortedActiveNonSystemObjectMetadataItems.filter(
      (objectMetadataItem) =>
        objectMetadataItem.id !== sourceObjectMetadataId &&
        !isObjectMetadataReadOnly({ objectMetadataItem }) &&
        normalizeSearchText(objectMetadataItem.labelPlural).includes(
          normalizedSearchFilter,
        ),
    );

  return (
    <DropdownRoot type="menu" dropdownId="settings-field-copy-to-object">
      <Dropdown.Trigger
        render={
          <Button startIcon={<IconCopy />} size="sm" variant="outline">
            {t`Copy to another object`}
          </Button>
        }
      />
      <DropdownContent align="start" width={GenericDropdownContentWidth.Large}>
        <Dropdown.Search
          value={searchFilter}
          placeholder={t`Search`}
          aria-label={t`Search`}
          onValueChange={setSearchFilter}
        />
        <Dropdown.Separator />
        <Dropdown.Section scrollable>
          {!isNonEmptyArray(targetObjectMetadataItems) ? (
            <Dropdown.Empty>{t`No results`}</Dropdown.Empty>
          ) : (
            targetObjectMetadataItems.map((objectMetadataItem) => (
              <Dropdown.ActionItem
                key={objectMetadataItem.id}
                startIcon={
                  <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
                }
                onClick={() =>
                  navigateSettings(
                    SettingsPath.ObjectNewFieldConfigure,
                    { objectNamePlural: objectMetadataItem.namePlural },
                    {
                      fieldType: fieldMetadataItem.type,
                      sourceFieldMetadataId: fieldMetadataItem.id,
                    },
                  )
                }
              >
                {objectMetadataItem.labelPlural}
              </Dropdown.ActionItem>
            ))
          )}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
