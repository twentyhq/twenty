import { useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';
import { IconPlus } from 'twenty-ui';

import { useLinksField } from '@/object-record/record-field/meta-types/hooks/useLinksField';
import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';
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
};

export const LinksFieldInput = ({ onCancel }: LinksFieldInputProps) => {
  const { persistLinksField, hotkeyScope, fieldValue } = useLinksField();

  const containerRef = useRef<HTMLDivElement>(null);

  const links = useMemo(
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

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();

      const isTargetInput =
        event.target instanceof HTMLInputElement &&
        event.target.tagName === 'INPUT';

      if (!isTargetInput) {
        onCancel?.();
      }
    },
  });

  const [isInputDisplayed, setIsInputDisplayed] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useScopedHotkeys(Key.Escape, onCancel ?? (() => {}), hotkeyScope);

  const handleSubmit = () => {
    if (!inputValue) return;

    setIsInputDisplayed(false);
    setInputValue('');

    if (!links.length) {
      persistLinksField({
        primaryLinkUrl: inputValue,
        primaryLinkLabel: '',
        secondaryLinks: [],
      });

      return;
    }

    persistLinksField({
      ...fieldValue,
      secondaryLinks: [
        ...(fieldValue.secondaryLinks ?? []),
        { label: '', url: inputValue },
      ],
    });
  };

  return (
    <StyledDropdownMenu ref={containerRef} width={200}>
      {!!links.length && (
        <>
          <DropdownMenuItemsContainer>
            {links.map(({ label, url }, index) => (
              <MenuItem
                key={index}
                text={<LinkDisplay value={{ label, url }} />}
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
          onEnter={handleSubmit}
          rightComponent={
            <LightIconButton Icon={IconPlus} onClick={handleSubmit} />
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
