import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { IconReload, IconX } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';

export type OverridableCheckboxType = 'default' | 'override' | 'no_cta';

const StyledOverridableCheckboxContainer = styled.div`
  align-items: center;
  display: inline-flex;
  justify-content: flex-start;
  width: 48px;
`;

const StyledOverridableCheckboxContainerItem = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const StyledIconWrapper = styled.div<{
  isDisabled?: boolean;
}>`
  align-items: center;
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  display: flex;
  height: 100%;
  justify-content: center;
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};
  width: 100%;
`;

const fadeRotateVariants = {
  initial: { opacity: 0, rotate: -90 },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 90 },
};

const AnimatedIconContainer = ({
  children,
  animationKey,
}: {
  children: React.ReactNode;
  animationKey: string;
}) => (
  <motion.div
    variants={fadeRotateVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.15 }}
    key={animationKey}
  >
    {children}
  </motion.div>
);

export type OverridableCheckboxProps = {
  type?: OverridableCheckboxType;
  onChange: () => void;
  checked: boolean;
  disabled: boolean;
};

export const OverridableCheckbox = ({
  type = 'default',
  onChange,
  checked,
  disabled,
}: OverridableCheckboxProps) => {
  const theme = useTheme();

  return (
    <StyledOverridableCheckboxContainer>
      <AnimatePresence mode="sync">
        {type === 'default' && (
          <>
            <StyledOverridableCheckboxContainerItem>
              <Checkbox checked={true} disabled={true} />
            </StyledOverridableCheckboxContainerItem>
            <StyledOverridableCheckboxContainerItem>
              <StyledIconWrapper
                onClick={disabled ? undefined : onChange}
                isDisabled={disabled}
              >
                {!disabled && (
                  <AnimatedIconContainer animationKey="iconX">
                    <IconX
                      size={theme.icon.size.md}
                      color={theme.font.color.secondary}
                    />
                  </AnimatedIconContainer>
                )}
              </StyledIconWrapper>
            </StyledOverridableCheckboxContainerItem>
          </>
        )}
        {type === 'override' && (
          <>
            <StyledOverridableCheckboxContainerItem>
              <Checkbox checked={false} disabled={true} />
            </StyledOverridableCheckboxContainerItem>
            <StyledOverridableCheckboxContainerItem>
              <StyledIconWrapper
                onClick={disabled ? undefined : onChange}
                isDisabled={disabled}
              >
                <AnimatedIconContainer animationKey="iconReload">
                  <IconReload
                    size={theme.icon.size.md}
                    color={theme.adaptiveColors.orange4}
                  />
                </AnimatedIconContainer>
              </StyledIconWrapper>
            </StyledOverridableCheckboxContainerItem>
          </>
        )}
        {type === 'no_cta' && (
          <StyledOverridableCheckboxContainerItem>
            <AnimatedIconContainer animationKey="checkbox">
              <Checkbox
                checked={checked}
                disabled={disabled}
                onChange={onChange}
              />
            </AnimatedIconContainer>
          </StyledOverridableCheckboxContainerItem>
        )}
      </AnimatePresence>
    </StyledOverridableCheckboxContainer>
  );
};
