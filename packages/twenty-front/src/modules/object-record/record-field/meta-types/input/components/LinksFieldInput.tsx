import { useLinksField } from '@/object-record/record-field/meta-types/hooks/useLinksField';
import { LinksFieldMenuItem } from '@/object-record/record-field/meta-types/input/components/LinksFieldMenuItem';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/states/recordFieldInputIsFieldInErrorComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useMemo } from 'react';
import { absoluteUrlSchema, isDefined } from 'twenty-shared';
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
  const { persistLinksField, hotkeyScope, fieldValue } = useLinksField();

  const links = useMemo<{ url: string; label: string }[]>(
    () =>
      [
        fieldValue.primaryLinkUrl
          ? {
              url: fieldValue.primaryLinkUrl,
              label: fieldValue.primaryLinkLabel,
            }
          : null,
        ...(fieldValue.secondaryLinks ?? []),
      ].filter(isDefined),
    [
      fieldValue.primaryLinkLabel,
      fieldValue.primaryLinkUrl,
      fieldValue.secondaryLinks,
    ],
  );

  const handlePersistLinks = (
    updatedLinks: { url: string; label: string }[],
  ) => {
    const [nextPrimaryLink, ...nextSecondaryLinks] = updatedLinks;
    persistLinksField({
      primaryLinkUrl: nextPrimaryLink?.url ?? '',
      primaryLinkLabel: nextPrimaryLink?.label ?? '',
      secondaryLinks: nextSecondaryLinks,
    });
  };

  const isPrimaryLink = (index: number) => index === 0 && links?.length > 1;

  const setIsFieldInError = useSetRecoilComponentStateV2(
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
      onClickOutside={onClickOutside}
      placeholder="URL"
      fieldMetadataType={FieldMetadataType.LINKS}
      validateInput={(input) => ({
        isValid: absoluteUrlSchema.safeParse(input).success,
        errorMessage: '',
      })}
      onError={handleError}
      formatInput={(input) => ({ url: input, label: '' })}
      renderItem={({
        value: link,
        index,
        handleEdit,
        handleSetPrimary,
        handleDelete,
      }) => (
        <LinksFieldMenuItem
          key={index}
          dropdownId={`${hotkeyScope}-links-${index}`}
          isPrimary={isPrimaryLink(index)}
          label={link.label}
          onEdit={handleEdit}
          onSetAsPrimary={handleSetPrimary}
          onDelete={handleDelete}
          url={link.url}
        />
      )}
      hotkeyScope={hotkeyScope}
    />
  );
};
