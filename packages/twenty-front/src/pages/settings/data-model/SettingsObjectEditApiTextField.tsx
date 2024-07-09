import { OBJECT_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/ObjectNameMaximumLength';
import { TextInput } from '@/ui/input/components/TextInput';
import { Controller } from 'react-hook-form';
import styled from '@emotion/styled';
import { IconTool } from 'twenty-ui';
import { useTheme } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';

const StyledInputContainer = styled.div`
  position: relative;
`;

export const SettingsObjectEditApiTextField = () => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const StyledIconContainer = styled.div`
    border-right: 1px solid ${({ theme }) => theme.color.yellow};
    left: -${({ theme }) => theme.spacing(7)};
    position: absolute;
    height: ${containerHeight}px;
    padding-right: ${({ theme }) => theme.spacing(0.5)};
  `;
  useEffect(() => {
    if (ref.current) {
      setContainerHeight(ref.current.clientHeight);
    }
  }, [ref]); // Dependency on ref
  return (
    <StyledInputContainer ref={ref}>
      <StyledIconContainer>
        <IconTool size={theme.icon.size.sm} color={theme.color.yellow} />
      </StyledIconContainer>
      <Controller
        name="apiName"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="API Name"
            placeholder="API Name"
            value={value}
            onChange={onChange}
            fullWidth
            maxLength={OBJECT_NAME_MAXIMUM_LENGTH}
          />
        )}
      />
    </StyledInputContainer>
  );
};
