import { useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';
import { IconPlus } from 'twenty-ui';

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
import { isDefined } from '~/utils/isDefined';

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

  const links = useMemo<{ url: string; label: string; isPrimary?: boolean }[]>(
    () =>
      [
        fieldValue.primaryLinkUrl
          ? {
              url: fieldValue.primaryLinkUrl,
              label: fieldValue.primaryLinkLabel,
              isPrimary: true,
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

  const handleAddLink = () => {
    if (!inputValue) return;

    setIsInputDisplayed(false);
    setInputValue('');

    if (!links.length) {
      onSubmit?.(() =>
        persistLinksField({
          primaryLinkUrl: inputValue,
          primaryLinkLabel: '',
          secondaryLinks: [],
        }),
      );

      return;
    }

    onSubmit?.(() =>
      persistLinksField({
        ...fieldValue,
        secondaryLinks: [
          ...(fieldValue.secondaryLinks ?? []),
          { label: '', url: inputValue },
        ],
      }),
    );
  };

  const handleDeleteLink = (index: number) => {
    const nextSecondaryLinks = [...(fieldValue.secondaryLinks ?? [])];
    nextSecondaryLinks.splice(index - 1, 1);

    onSubmit?.(() =>
      persistLinksField({
        ...fieldValue,
        secondaryLinks: nextSecondaryLinks,
      }),
    );
  };

  return (
    <StyledDropdownMenu ref={containerRef} width={200}>
      {!!links.length && (
        <>
          <DropdownMenuItemsContainer>
            {links.map(({ isPrimary, label, url }, index) => (
              <LinksFieldMenuItem
                key={index}
                dropdownId={`${hotkeyScope}-links-${index}`}
                isPrimary={isPrimary}
                label={label}
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
          onEnter={handleAddLink}
          rightComponent={
            <LightIconButton Icon={IconPlus} onClick={handleAddLink} />
          }
        />
      ) : (
        <DropdownMenuItemsContainer>
          <MenuItem
            onClick={() => setIsInputDisplayed(true)}
            LeftIcon={IconPlus}
            text="Add link"
          />
        </DropdownMenuItemsContainer>
      )}
    </StyledDropdownMenu>
  );
};
