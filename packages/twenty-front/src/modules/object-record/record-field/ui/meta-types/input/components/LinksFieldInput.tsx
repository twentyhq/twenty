import { getLinksVariant } from '@/object-record/spreadsheet-import/utils/getLinksVariant';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useLinksField } from '@/object-record/record-field/ui/meta-types/hooks/useLinksField';
import { LinksFieldEditInputs } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldEditInputs';
import { LinksFieldEditPreview } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldEditPreview';
import { LinksFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldMenuItem';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useLinksLabelEditing } from '@/object-record/record-field/ui/meta-types/input/hooks/useLinksLabelEditing';
import { type LinkRecord } from '@/object-record/record-field/ui/meta-types/input/types/LinkRecord';
import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { getLinkLabelFromDraft } from '@/object-record/record-field/ui/meta-types/input/utils/getLinkLabelFromDraft';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { linksFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/linksFieldValueSchema';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useContext, useMemo } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import {
  absoluteUrlSchema,
  isDefined,
  isValidDomain,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { MultiItemFieldInput } from './MultiItemFieldInput';

export const LinksFieldInput = () => {
  const { t } = useLingui();
  const { draftValue, fieldDefinition, setDraftValue } = useLinksField();

  const { onEscape, onClickOutside, onEnter, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const links = useMemo<{ url: string; label: string | null }[]>(
    () => getFieldLinkDefinedLinks(draftValue),
    [draftValue],
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
      setDraftValue(nextValue);
    }
  };

  const { labelDraft, setLabelDraft, startEditing, stopEditing, getLinkLabel } =
    useLinksLabelEditing({ links });

  const withEditingStopped = (action: () => void) => () => {
    stopEditing();
    action();
  };

  const getShowPrimaryIcon = (index: number) => index === 0 && links.length > 1;
  const getShowSetAsPrimaryButton = (index: number) => index > 0;

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const handleError = (hasError: boolean, values: LinkRecord[]) => {
    setRecordFieldInputIsFieldInError(hasError && values.length === 0);
  };

  const handleClickOutside = (
    updatedLinks: LinkRecord[],
    event: MouseEvent | TouchEvent,
  ) => {
    onClickOutside?.({ newValue: parseArrayToLinksValue(updatedLinks), event });
  };

  const handleEscape = (updatedLinks: LinkRecord[]) => {
    onEscape?.({ newValue: parseArrayToLinksValue(updatedLinks) });
  };

  const handleEnter = (updatedLinks: LinkRecord[]) => {
    onEnter?.({ newValue: parseArrayToLinksValue(updatedLinks) });
  };

  const handleSubmit = (updatedLinks: LinkRecord[]) => {
    onSubmit?.({
      newValue: parseArrayToLinksValue(updatedLinks),
      skipClose: true,
    });
  };

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  const isDomainField =
    getLinksVariant({
      type: FieldMetadataType.LINKS,
      settings: fieldDefinition.metadata.settings,
    }) === 'domain';

  const validateInput = (input: string) =>
    isDomainField
      ? isValidDomain(input)
      : absoluteUrlSchema.safeParse(input).success;

  const renderEditedLink = ({
    inputValue,
    hasError,
    saveButton,
    separator,
    onInputChange,
    onEnter,
  }: {
    inputValue: string;
    hasError: boolean;
    saveButton: ReactNode;
    separator: ReactNode;
    onInputChange: (value: string) => void;
    onEnter: () => void;
  }) => (
    <>
      <LinksFieldEditPreview
        url={inputValue}
        label={getLinkLabelFromDraft(labelDraft)}
        saveButton={saveButton}
      />
      {separator}
      <LinksFieldEditInputs
        url={inputValue}
        label={labelDraft}
        hasError={hasError}
        onUrlChange={onInputChange}
        onLabelChange={setLabelDraft}
        onEnter={onEnter}
      />
    </>
  );

  return (
    <MultiItemFieldInput
      items={links}
      onChange={handleChange}
      onEscape={handleEscape}
      onEnter={handleEnter}
      onSubmit={handleSubmit}
      onClickOutside={handleClickOutside}
      placeholder={isDomainField ? t`Domain` : t`URL`}
      fieldMetadataType={FieldMetadataType.LINKS}
      validateInput={(input) => ({
        isValid: validateInput(input),
        errorMessage: '',
      })}
      onError={handleError}
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
          dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${index}`}
          showPrimaryIcon={getShowPrimaryIcon(index)}
          showSetAsPrimaryButton={getShowSetAsPrimaryButton(index)}
          label={link.label}
          onEdit={() => {
            startEditing(index);
            handleEdit();
          }}
          onSetAsPrimary={withEditingStopped(handleSetPrimary)}
          onDelete={withEditingStopped(handleDelete)}
          url={link.url}
        />
      )}
      renderEditedItem={isDomainField ? undefined : renderEditedLink}
      maxItemCount={maxNumberOfValues}
    />
  );
};
