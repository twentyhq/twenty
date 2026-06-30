import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useLinksField } from '@/object-record/record-field/ui/meta-types/hooks/useLinksField';
import { LinksFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldMenuItem';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { linksFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/linksFieldValueSchema';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext, useMemo, useState } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { absoluteUrlSchema, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { MultiItemFieldInput } from './MultiItemFieldInput';
import styled from '@emotion/styled';

const StyledLinksInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 4px 0;
`;

const StyledUrlInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background: white;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const StyledLabelInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background: white;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

type LinkRecord = {
  url: string | null;
  label: string | null;
};

export const LinksFieldInput = () => {
  const { draftValue, fieldDefinition, setDraftValue } = useLinksField();

  const { onEscape, onClickOutside, onEnter } = useContext(
    FieldInputEventContext,
  );

  const links = useMemo<{ url: string; label: string | null }[]>(
    () => getFieldLinkDefinedLinks(draftValue),
    [draftValue],
  );

  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');

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

  const handleChange = (
    updatedLinks: { url: string | null; label: string | null }[],
  ) => {
    const nextValue = parseArrayToLinksValue(updatedLinks);

    if (isDefined(nextValue)) {
      setDraftValue(nextValue);
    }
  };

  const getShowPrimaryIcon = (index: number) => index === 0 && links.length > 1;
  const getShowSetAsPrimaryButton = (index: number) => index > 0;

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const handleError = (hasError: boolean, values: any[]) => {
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

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  return (
    <MultiItemFieldInput
      items={links}
      onChange={handleChange}
      onEscape={handleEscape}
      onEnter={handleEnter}
      onClickOutside={handleClickOutside}
      placeholder="URL"
      fieldMetadataType={FieldMetadataType.LINKS}
      validateInput={(input) => {
        try {
          const parsed = JSON.parse(input);
          const isValid = absoluteUrlSchema.safeParse(parsed.url).success;
          return { isValid, errorMessage: '' };
        } catch {
          const isValid = absoluteUrlSchema.safeParse(input).success;
          return { isValid, errorMessage: '' };
        }
      }}
      onError={handleError}
      formatInput={(input) => {
        try {
          const parsed = JSON.parse(input);
          return { url: parsed.url, label: parsed.label || null };
        } catch {
          return { url: input, label: null };
        }
      }}
      renderInput={({ value, onChange, autoFocus }) => {
        let url = '';
        let label = '';

        try {
          const parsed = JSON.parse(value);
          url = parsed.url || '';
          label = parsed.label || '';
        } catch {
          url = value || '';
        }

        const updateUrl = (newUrl: string) => {
          onChange(JSON.stringify({ url: newUrl, label }));
        };

        const updateLabel = (newLabel: string) => {
          onChange(JSON.stringify({ url, label: newLabel }));
        };

        return (
          <StyledLinksInputContainer>
            <StyledUrlInput
              value={url}
              onChange={(e) => updateUrl(e.target.value)}
              placeholder="URL"
              autoFocus={autoFocus}
            />
            <StyledLabelInput
              value={label}
              onChange={(e) => updateLabel(e.target.value)}
              placeholder="Label (optional)"
            />
          </StyledLinksInputContainer>
        );
      }}
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
          onEdit={handleEdit}
          onSetAsPrimary={handleSetPrimary}
          onDelete={handleDelete}
          url={link.url}
        />
      )}
      maxItemCount={maxNumberOfValues}
    />
  );
};
