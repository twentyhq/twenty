import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { IconComponent, IconDotsVertical, LightIconButton } from 'twenty-ui';
import { SelectHotkeyScope } from '@/ui/input/types/SelectHotkeyScope';
import styled from '@emotion/styled';
import { Placement } from '@floating-ui/react';
import { ReactNode } from 'react';

import { useTheme } from '@emotion/react';

const StyledEndIcon = styled.div`
  display: inline-flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(1)};
  margin-left: auto;
  margin-right: 0;

  & > svg {
    height: ${({ theme }) => theme.icon.size.md}px;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;

export type DropdownMenuHeaderEndIconProps =
  | {
      EndIcon: IconComponent;
      dropdownPlacement: Placement;
      dropdownContent: ReactNode;
      dropdownId: string;
    }
  | {
      EndIcon: IconComponent;
    };

export const DropdownMenuHeaderEndIcon = ({
  EndIcon,
  ...dropdownProps
}: DropdownMenuHeaderEndIconProps) => {
  const theme = useTheme();

  return (
    <StyledEndIcon>
      <EndIcon size={theme.icon.size.md} />
      {'dropdownId' in dropdownProps && (
        <div className="hoverable-buttons">
          <Dropdown
            clickableComponent={
              <LightIconButton
                Icon={EndIcon ?? IconDotsVertical}
                size="small"
                accent="tertiary"
              />
            }
            dropdownPlacement={dropdownProps.dropdownPlacement}
            dropdownComponents={dropdownProps.dropdownContent}
            dropdownId={dropdownProps.dropdownId}
            dropdownHotkeyScope={{ scope: SelectHotkeyScope.Select }}
          />
        </div>
      )}
    </StyledEndIcon>
  );
};
