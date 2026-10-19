import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { LinksFieldLabelInput } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldLabelInput';
import { LinksFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useLinksLabelEditing } from '@/object-record/record-field/ui/meta-types/input/hooks/useLinksLabelEditing';
import { type LinkRecord } from '@/object-record/record-field/ui/meta-types/input/types/LinkRecord';
import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { getLinkLabelFromDraft } from '@/object-record/record-field/ui/meta-types/input/utils/getLinkLabelFromDraft';
import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { linksFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/linksFieldValueSchema';
import { getLinksVariant } from '@/object-record/spreadsheet-import/utils/getLinksVariant';
import { FieldInputDomainFaviconPrefix } from '@/ui/field/input/components/FieldInputDomainFaviconPrefix';
import { type FieldInputVariant } from '@/ui/field/input/types/FieldInputVariant';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import {
  absoluteUrlSchema,
  isDefined,
  isValidDomain,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type LinksMultiItemInputProps = {
  value: FieldLinksValue | null | undefined;
  fieldName: string;
  settings: FieldMetadataItem['settings'];
  variant?: FieldInputVariant;
  placeholder?: string;
  onChange: (value: FieldLinksValue) => void;
  onEnter?: (value: FieldLinksValue | undefined) => void;
  onEscape?: (value: FieldLinksValue | undefined) => void;
  onSubmit?: (value: FieldLinksValue | undefined) => void;
  onClickOutside?: (
    value: FieldLinksValue | undefined,
    event: MouseEvent | TouchEvent,
  ) => void;
  onError?: (hasError: boolean, values: LinkRecord[]) => void;
};

export const LinksMultiItemInput = ({
  value,
  fieldName,
  settings,
  variant,
  placeholder,
  onChange,
  onEnter,
  onEscape,
  onSubmit,
  onClickOutside,
  onError,
}: LinksMultiItemInputProps) => {
  const { t } = useLingui();

  const isDomainField =
    getLinksVariant({ type: FieldMetadataType.LINKS, settings }) === 'domain';

  const links = useMemo<{ url: string; label: string | null }[]>(
    () => getFieldLinkDefinedLinks(value),
    [value],
  );

  const parseArrayToLinksValue = (links: LinkRecord[]) => {
    const nextPrimaryLink = links.at(0);
    const nextSecondaryLinks = links.slice(1);
    const nextValue: FieldLinksValue = {
      primaryLinkUrl: nextPrimaryLink?.url ?? null,
      primaryLinkLabel: nextPrimaryLink?.label ?? null,
      secondaryLinks: nextSecondaryLinks,
    };
    const parseResponse = linksFieldValueSchema.safeParse(nextValue);
    if (parseResponse.success) {
      return parseResponse.data;
    }
  };

  const handleChange = (updatedLinks: LinkRecord[]) => {
    const nextValue = parseArrayToLinksValue(updatedLinks);

    if (isDefined(nextValue)) {
      onChange(nextValue);
    }
  };

  const handleSubmit = (updatedLinks: LinkRecord[]) => {
    onSubmit?.(parseArrayToLinksValue(updatedLinks));
  };

  const {
    editedLink,
    labelDraft,
    setLabelDraft,
    startUrlEditing,
    startLabelEditing,
    stopEditing,
    getLinkLabel,
  } = useLinksLabelEditing({ links });

  const withEditingStopped = (action: () => void) => () => {
    stopEditing();
    action();
  };

  const getShowPrimaryIcon = (index: number) => index === 0 && links.length > 1;
  const getShowSetAsPrimaryButton = (index: number) => index > 0;

  const validateInput = (input: string) =>
    isDomainField
      ? isValidDomain(input)
      : absoluteUrlSchema.safeParse(input).success;

  return (
    <MultiItemFieldInput
      variant={variant}
      items={links}
      onChange={handleChange}
      onEscape={(updatedLinks) =>
        onEscape?.(parseArrayToLinksValue(updatedLinks))
      }
      onEnter={(updatedLinks) =>
        onEnter?.(parseArrayToLinksValue(updatedLinks))
      }
      onSubmit={handleSubmit}
      onClickOutside={(updatedLinks, event) =>
        onClickOutside?.(parseArrayToLinksValue(updatedLinks), event)
      }
      placeholder={isDomainField ? t`Domain` : t`URL`}
      inputPlaceholder={placeholder}
      fieldMetadataType={FieldMetadataType.LINKS}
      validateInput={(input) => ({
        isValid: validateInput(input),
        errorMessage: '',
      })}
      onError={onError}
      formatInput={(input, index) => ({
        url: input,
        label: getLinkLabel(index),
      })}
      renderItem={({
        value: link,
        index,
        handleEdit,
        handleSetPrimary,
        handleDelete,
      }) => (
        <LinksFieldMenuItem
          key={index}
          dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldName}-${index}`}
          showPrimaryIcon={getShowPrimaryIcon(index)}
          showSetAsPrimaryButton={getShowSetAsPrimaryButton(index)}
          label={link.label}
          onEdit={() => {
            startUrlEditing(index);
            handleEdit();
          }}
          onEditLabel={
            isDomainField
              ? undefined
              : () => {
                  startLabelEditing(index);
                  handleEdit();
                }
          }
          onSetAsPrimary={withEditingStopped(handleSetPrimary)}
          onDelete={withEditingStopped(handleDelete)}
          url={link.url}
        />
      )}
      renderEditedItemDetails={({ index, onEnter, updateEditedItem }) =>
        editedLink?.index === index && editedLink.isLabelInputShown ? (
          <LinksFieldLabelInput
            value={labelDraft}
            placeholder={editedLink.url}
            onChange={(draft) => {
              setLabelDraft(draft);
              updateEditedItem((link) => ({
                ...link,
                label: getLinkLabelFromDraft(draft),
              }));
            }}
            onEnter={onEnter}
          />
        ) : null
      }
      renderInputLeftComponent={
        isDomainField
          ? (inputValue) => (
              <FieldInputDomainFaviconPrefix domain={inputValue} />
            )
          : undefined
      }
      maxItemCount={
        settings?.maxNumberOfValues ?? MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES
      }
    />
  );
};
