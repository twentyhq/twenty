import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useLinksField } from '@/object-record/record-field/ui/meta-types/hooks/useLinksField';
import { LinksFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldMenuItem';
import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { linksSchema } from '@/object-record/record-field/ui/types/guards/isFieldLinksValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useContext, useMemo } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { absoluteUrlSchema } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { MultiItemFieldInput } from './MultiItemFieldInput';

export const LinksFieldInput = () => {
  const { draftValue, fieldDefinition, setDraftValue } = useLinksField();

  const { onEscape, onClickOutside } = useContext(FieldInputEventContext);

  const links = useMemo<{ url: string; label: string | null }[]>(
    () => getFieldLinkDefinedLinks(draftValue),
    [draftValue],
  );

  const handleChange = (
    updatedLinks: { url: string | null; label: string | null }[],
  ) => {
    const nextPrimaryLink = updatedLinks.at(0);
    const nextSecondaryLinks = updatedLinks.slice(1);

    const nextValue = {
      primaryLinkUrl: nextPrimaryLink?.url ?? null,
      primaryLinkLabel: nextPrimaryLink?.label ?? null,
      secondaryLinks: nextSecondaryLinks,
    };

    const parseResponse = linksSchema.safeParse(nextValue);

    if (parseResponse.success) {
      setDraftValue(parseResponse.data);
    }
  };

  const getShowPrimaryIcon = (index: number) => index === 0 && links.length > 1;
  const getShowSetAsPrimaryButton = (index: number) => index > 0;

  const setIsFieldInError = useSetRecoilComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const handleError = (hasError: boolean, values: any[]) => {
    setIsFieldInError(hasError && values.length === 0);
  };

  const handleClickOutside = (
    _newValue: any,
    event: MouseEvent | TouchEvent,
  ) => {
    onClickOutside?.({ newValue: draftValue, event });
  };

  const handleEscape = (_newValue: any) => {
    onEscape?.({ newValue: draftValue });
  };

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  return (
    <MultiItemFieldInput
      items={links}
      onChange={handleChange}
      onEscape={handleEscape}
      onClickOutside={handleClickOutside}
      placeholder="URL"
      fieldMetadataType={FieldMetadataType.LINKS}
      validateInput={(input) => ({
        isValid: absoluteUrlSchema.safeParse(input).success,
        errorMessage: '',
      })}
      onError={handleError}
      formatInput={(input) => ({ url: input, label: null })}
      renderItem={({
        value: link,
        index,
        handleEdit,
        handleSetPrimary,
        handleDelete,
      }) => (
        <LinksFieldMenuItem
          key={index}
          dropdownId={`links-field-input-${fieldDefinition.metadata.fieldName}-${index}`}
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
