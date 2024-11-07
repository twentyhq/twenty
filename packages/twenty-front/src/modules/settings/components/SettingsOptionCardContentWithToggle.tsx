import { SettingsOptionCardContent } from '@/settings/components/SettingsOptionCardContent';
import styled from '@emotion/styled';
import { useId } from 'react';
import { IconComponent, Toggle } from 'twenty-ui';

const StyledToggle = styled(Toggle)`
  margin-left: auto;
`;

const StyledCover = styled.span`
  cursor: pointer;
  inset: 0;
  position: absolute;
`;

export const SettingsOptionCardContentWithToggle = ({
  Icon,
  title,
  description,
  divider,
  checked,
  onChange,
}: {
  Icon?: IconComponent;
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description: string;
  divider?: boolean;
}) => {
  const toggleId = useId();

  return (
    <SettingsOptionCardContent
      title={
        <label htmlFor={toggleId}>
          {title}

          <StyledCover />
        </label>
      }
      description={description}
      Icon={Icon}
      divider={divider}
    >
      <StyledToggle id={toggleId} value={checked} onChange={onChange} />
    </SettingsOptionCardContent>
  );
};
