import { useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';
import { IconCheck, IconPlus } from 'twenty-ui';

import { useLinksField } from '@/object-record/record-field/meta-types/hooks/useLinksField';
import { LinksFieldMenuItem } from '@/object-record/record-field/meta-types/input/components/LinksFieldMenuItem';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';
import { isDefined } from '~/utils/isDefined';
import { absoluteUrlSchema } from '~/utils/validation-schemas/absoluteUrlSchema';

const StyledDropdownMenu = styled(DropdownMenu)`
  left: -1px;
  position: absolute;
  top: -1px;
`;

export type LinksFieldInputProps = {
  onCancel?: () => void;
  onSubmit?: FieldInputEvent;
};

export const LinksFieldInput = ({
  onCancel,
  onSubmit,
}: LinksFieldInputProps) => {
  const { persistLinksField, hotkeyScope, fieldValue } = useLinksField();

  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleDropdownClose = () => {
    onCancel?.();
  };

  useListenClickOutside({
    refs: [containerRef],
    callback: handleDropdownClose,
  });

  useScopedHotkeys(Key.Escape, handleDropdownClose, hotkeyScope);

  const [isInputDisplayed, setIsInputDisplayed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [linkToEditIndex, setLinkToEditIndex] = useState(-1);
  const isAddingNewLink = linkToEditIndex === -1;

  const handleAddButtonClick = () => {
    setLinkToEditIndex(-1);
    setIsInputDisplayed(true);
  };

  const handleEditButtonClick = (index: number) => {
    setLinkToEditIndex(index);
    setInputValue(links[index].url);
    setIsInputDisplayed(true);
  };

  const urlInputValidation = inputValue
    ? absoluteUrlSchema.safeParse(inputValue)
    : null;

  const handleSubmitInput = () => {
    if (!urlInputValidation?.success) return;

    const validatedInputValue = urlInputValidation.data;

    // Don't persist if value hasn't changed.
    if (
      !isAddingNewLink &&
      validatedInputValue === links[linkToEditIndex].url
    ) {
      setIsInputDisplayed(false);
      setInputValue('');
      onCancel?.();
      return;
    }

    const linkValue = { label: '', url: validatedInputValue };
    const nextLinks = isAddingNewLink
      ? [...links, linkValue]
      : toSpliced(links, linkToEditIndex, 1, linkValue);
    const [nextPrimaryLink, ...nextSecondaryLinks] = nextLinks;

    onSubmit?.(() =>
      persistLinksField({
        primaryLinkUrl: nextPrimaryLink.url ?? '',
        primaryLinkLabel: nextPrimaryLink.label ?? '',
        secondaryLinks: nextSecondaryLinks,
      }),
    );

    setIsInputDisplayed(false);
    setInputValue('');
  };

  const handleSetPrimaryLink = (index: number) => {
    const nextLinks = moveArrayItem(links, { fromIndex: index, toIndex: 0 });
    const [nextPrimaryLink, ...nextSecondaryLinks] = nextLinks;

    onSubmit?.(() =>
      persistLinksField({
        primaryLinkUrl: nextPrimaryLink.url ?? '',
        primaryLinkLabel: nextPrimaryLink.label ?? '',
        secondaryLinks: nextSecondaryLinks,
      }),
    );
  };

  const handleDeleteLink = (index: number) => {
    onSubmit?.(() =>
      persistLinksField({
        ...fieldValue,
        secondaryLinks: toSpliced(
          fieldValue.secondaryLinks ?? [],
          index - 1,
          1,
        ),
      }),
    );
  };

  return (
    <StyledDropdownMenu ref={containerRef} width={200}>
      {!!links.length && (
        <>
          <DropdownMenuItemsContainer>
            {links.map(({ label, url }, index) => (
              <LinksFieldMenuItem
                key={index}
                dropdownId={`${hotkeyScope}-links-${index}`}
                isPrimary={index === 0}
                label={label}
                onEdit={() => handleEditButtonClick(index)}
                onSetAsPrimary={() => handleSetPrimaryLink(index)}
                onDelete={() => handleDeleteLink(index)}
                url={url}
              />
            ))}
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
        </>
      )}
      {isInputDisplayed ? (
        <DropdownMenuInput
          autoFocus
          placeholder="URL"
          value={inputValue}
          hotkeyScope={hotkeyScope}
          onChange={(event) => setInputValue(event.target.value)}
          onEnter={handleSubmitInput}
          rightComponent={
            <LightIconButton
              Icon={isAddingNewLink ? IconPlus : IconCheck}
              disabled={!urlInputValidation?.success}
              onClick={handleSubmitInput}
            />
          }
        />
      ) : (
        <DropdownMenuItemsContainer>
          <MenuItem
            onClick={handleAddButtonClick}
            LeftIcon={IconPlus}
            text="Add link"
          />
        </DropdownMenuItemsContainer>
      )}
    </StyledDropdownMenu>
  );
};
