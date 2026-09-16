import styled from '@emotion/styled';
import { isDefined } from 'twenty-sdk/utils';
import { type ReactNode } from 'react';
import { MenuItem, MenuItemAvatar } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type SlackPickerOptionAvatar = {
  placeholder: string;
  placeholderColorSeed: string;
  type: 'rounded' | 'squared';
};

export type SlackPickerOption = {
  key: string;
  name: string;
  meta?: string;
  avatar?: SlackPickerOptionAvatar;
  isSelected?: boolean;
};

const StyledDropdownPanel = styled.div`
  background: ${() => themeCssVariables.background.primary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-shadow: ${() => themeCssVariables.boxShadow.light};
  box-sizing: border-box;
  left: 0;
  margin-top: ${() => themeCssVariables.spacing[1]};
  min-width: 240px;
  position: absolute;
  top: 100%;
  width: 100%;
  z-index: 2;
`;

const StyledOptions = styled.div`
  max-height: 240px;
  overflow-y: auto;
  padding: ${() => themeCssVariables.spacing[1]};
`;

type SlackPickerDropdownPanelProps = {
  options: SlackPickerOption[];
  isSearching: boolean;
  emptyText: string;
  listLabel: string;
  onSelect: (optionKey: string) => void;
  header?: ReactNode;
};

export const SlackPickerDropdownPanel = ({
  options,
  isSearching,
  emptyText,
  listLabel,
  onSelect,
  header,
}: SlackPickerDropdownPanelProps) => (
  <StyledDropdownPanel>
    {header}
    <StyledOptions
      role="listbox"
      aria-label={listLabel}
      onMouseDown={(event) => event.preventDefault()}
    >
      {options.map((option) => (
        <div
          key={option.key}
          role="option"
          aria-selected={option.isSelected === true}
        >
          {isDefined(option.avatar) ? (
            <MenuItemAvatar
              avatar={{
                type: option.avatar.type,
                size: 'md',
                placeholder: option.avatar.placeholder,
                placeholderColorSeed: option.avatar.placeholderColorSeed,
              }}
              text={option.name}
              contextualText={option.meta}
              onClick={() => onSelect(option.key)}
            />
          ) : (
            <MenuItem
              text={option.name}
              contextualText={option.meta}
              selected={option.isSelected}
              onClick={() => onSelect(option.key)}
            />
          )}
        </div>
      ))}
      {options.length === 0 && (
        <MenuItem disabled text={isSearching ? 'Searching…' : emptyText} />
      )}
    </StyledOptions>
  </StyledDropdownPanel>
);
