import { useLinksField } from '@/object-record/record-field/meta-types/hooks/useLinksField';
import { LinksFieldMenuItem } from '@/object-record/record-field/meta-types/input/components/LinksFieldMenuItem';
import { getFieldLinkDefinedLinks } from '@/object-record/record-field/meta-types/input/utils/getFieldLinkDefinedLinks';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/states/recordFieldInputIsFieldInErrorComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useMemo } from 'react';
import { absoluteUrlSchema } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { MultiItemFieldInput } from './MultiItemFieldInput';

type LinksFieldInputProps = {
  onCancel?: () => void;
  onClickOutside?: (event: MouseEvent | TouchEvent) => void;
};

export const LinksFieldInput = ({
  onCancel,
  onClickOutside,
}: LinksFieldInputProps) => {
  const { persistLinksField, fieldValue, fieldDefinition } = useLinksField();

  const links = useMemo<{ url: string; label: string | null }[]>(
    () => getFieldLinkDefinedLinks(fieldValue),
    [fieldValue],
  );

  const handlePersistLinks = (
    updatedLinks: { url: string | null; label: string | null }[],
  ) => {
    const nextPrimaryLink = updatedLinks.at(0);
    const nextSecondaryLinks = updatedLinks.slice(1);

    persistLinksField({
      primaryLinkUrl: nextPrimaryLink?.url ?? null,
      primaryLinkLabel: nextPrimaryLink?.label ?? null,
      secondaryLinks: nextSecondaryLinks,
    });
  };

  const getShowPrimaryIcon = (index: number) => index === 0 && links.length > 1;
  const getShowSetAsPrimaryButton = (index: number) => index > 0;

  const setIsFieldInError = useSetRecoilComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const handleError = (hasError: boolean, values: any[]) => {
    setIsFieldInError(hasError && values.length === 0);
  };

  return (
    <MultiItemFieldInput
      items={links}
      onPersist={handlePersistLinks}
      onCancel={onCancel}
      onClickOutside={(persist, event) => {
        onClickOutside?.(event);
        persist();
      }}
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
    />
  );
};
