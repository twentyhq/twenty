import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectMetadataSelectHelpers } from '@/object-metadata/hooks/useObjectMetadataSelectHelpers';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import {
  IconBox,
  IconDatabase,
  IconFileInfo,
  IconListDetails,
  IconTable,
  IconWebhook,
} from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';

const StyledScrollableSections = styled.div`
  max-height: 176px;
  overflow-y: auto;
`;

const WEBHOOK_ENTITY_DROPDOWN_ID = 'webhook-entity-select';

type WebhookEntitySelectProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  dropdownId?: string;
};

export const WebhookEntitySelect = ({
  value,
  onChange,
  disabled = false,
  dropdownId = WEBHOOK_ENTITY_DROPDOWN_ID,
}: WebhookEntitySelectProps) => {
  const { getSelectIconPropsFromObjectMetadataItem } =
    useObjectMetadataSelectHelpers();
  const [searchInput, setSearchInput] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();

  const metadataOptions: SelectOption<string>[] = [
    { label: t`All Metadata`, value: 'metadata.*', Icon: IconFileInfo },
    { label: t`Object`, value: 'metadata.objectMetadata', Icon: IconBox },
    { label: t`Field`, value: 'metadata.fieldMetadata', Icon: IconListDetails },
    { label: t`View`, value: 'metadata.view', Icon: IconTable },
    {
      label: t`View Field`,
      value: 'metadata.viewField',
      Icon: IconListDetails,
    },
    { label: t`Index`, value: 'metadata.index', Icon: IconDatabase },
    { label: t`Webhook`, value: 'metadata.webhook', Icon: IconWebhook },
  ];

  const objectOptions: SelectOption<string>[] = [
    { label: t`All Objects`, value: '*', Icon: IconBox },
    ...[...objectMetadataItems]
      .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural))
      .map((item) => ({
        label: item.labelPlural,
        value: item.nameSingular,
        ...getSelectIconPropsFromObjectMetadataItem(item),
      })),
  ];

  const filteredObjectOptions = objectOptions.filter((option) =>
    option.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const filteredMetadataOptions = metadataOptions.filter((option) =>
    option.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const selectedOption = !isDefined(value)
    ? { label: t`Select entity`, value: '' }
    : ([...objectOptions, ...metadataOptions].find(
        (option) => option.value === value,
      ) ?? { label: value, value, Icon: IconBox });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchInput('');
    }
  };

  const shouldShowObjects = filteredObjectOptions.length > 0;
  const shouldShowMetadata = filteredMetadataOptions.length > 0;
  const shouldShowSeparator = shouldShowObjects && shouldShowMetadata;

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      onOpenChange={handleOpenChange}
    >
      <Dropdown.Trigger
        render={<div />}
        nativeButton={false}
        disabled={disabled}
      >
        <SelectControl
          selectedOption={selectedOption}
          isDisabled={disabled}
          textAccent={!isDefined(value) ? 'placeholder' : 'default'}
        />
      </Dropdown.Trigger>
      <DropdownContent align="start" aria-label={t`Select entity`}>
        <Dropdown.Search
          value={searchInput}
          placeholder={t`Search...`}
          aria-label={t`Search`}
          onValueChange={setSearchInput}
        />
        <Dropdown.Separator />
        <StyledScrollableSections>
          {shouldShowObjects && (
            <Dropdown.Section label={t`Core Objects`}>
              {filteredObjectOptions.map((option) => (
                <Dropdown.OptionItem
                  key={option.value}
                  selected={value === option.value}
                  onSelect={() => onChange(option.value)}
                  startIcon={
                    <SelectOptionIcon
                      Icon={option.Icon}
                      color={option.iconThemeColor}
                    />
                  }
                >
                  {option.label}
                </Dropdown.OptionItem>
              ))}
            </Dropdown.Section>
          )}
          {shouldShowSeparator && <Dropdown.Separator />}
          {shouldShowMetadata && (
            <Dropdown.Section label={t`Metadata`}>
              {filteredMetadataOptions.map((option) => (
                <Dropdown.OptionItem
                  key={option.value}
                  selected={value === option.value}
                  onSelect={() => onChange(option.value)}
                  startIcon={<SelectOptionIcon Icon={option.Icon} />}
                >
                  {option.label}
                </Dropdown.OptionItem>
              ))}
            </Dropdown.Section>
          )}
        </StyledScrollableSections>
      </DropdownContent>
    </DropdownRoot>
  );
};
