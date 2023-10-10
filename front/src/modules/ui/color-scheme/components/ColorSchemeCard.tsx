import React from 'react';
import styled from '@emotion/styled';
import {
  AnimatePresence,
  AnimationControls,
  motion,
  useAnimation,
} from 'framer-motion';

import { Checkmark } from '@/ui/checkmark/components/Checkmark';
import DarkNoise from '@/ui/theme/assets/dark-noise.jpg';
import LightNoise from '@/ui/theme/assets/light-noise.png';
import { ColorScheme } from '~/generated/graphql';

const StyledColorSchemeBackground = styled.div<
  Pick<ColorSchemeCardProps, 'variant'>
>`
  align-items: flex-end;
  background: ${({ variant }) => {
    switch (variant) {
      case 'dark':
        return `url(${DarkNoise.toString()});`;
      case 'light':
      default:
        return `url(${LightNoise.toString()});`;
    }
  }};
  border: ${({ variant, theme }) => {
    switch (variant) {
      case 'dark':
        return `1px solid ${theme.grayScale.gray70};`;
      case 'light':
      default:
        return `1px solid ${theme.grayScale.gray20};`;
    }
  }};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 80px;
  justify-content: flex-end;
  overflow: hidden;
  padding-left: ${({ theme }) => theme.spacing(6)};
  padding-top: ${({ theme }) => theme.spacing(6)};
  width: 120px;
`;

const StyledColorSchemeContent = styled(motion.div)<
  Pick<ColorSchemeCardProps, 'variant'>
>`
  background: ${({ theme, variant }) => {
    switch (variant) {
      case 'dark':
        return theme.grayScale.gray75;
      case 'light':
        return theme.grayScale.gray0;
    }
  }};

  border-left: ${({ variant, theme }) => {
    switch (variant) {
      case 'dark':
        return `1px solid ${theme.grayScale.gray60};`;
      case 'light':
      default:
        return `1px solid ${theme.grayScale.gray20};`;
    }
  }};
  border-radius: ${({ theme }) => theme.border.radius.md} 0px 0px 0px;
  border-top: ${({ variant, theme }) => {
    switch (variant) {
      case 'dark':
        return `1px solid ${theme.grayScale.gray60};`;
      case 'light':
      default:
        return `1px solid ${theme.grayScale.gray20};`;
    }
  }};
  box-sizing: border-box;
  color: ${({ variant, theme }) => {
    switch (variant) {
      case 'dark':
        return theme.grayScale.gray30;
      case 'light':
      default:
        return theme.grayScale.gray60;
    }
  }};
  display: flex;
  flex: 1;
  font-size: 20px;
  height: 56px;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

export type ColorSchemeSegmentProps = {
  variant: `${Lowercase<ColorScheme.Dark | ColorScheme.Light>}`;
  controls: AnimationControls;
} & React.ComponentPropsWithoutRef<'div'>;

const ColorSchemeSegment = ({
  variant,
  controls,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ColorSchemeSegmentProps) => (
  <StyledColorSchemeBackground
    {...{ variant, style, onClick, onMouseEnter, onMouseLeave }}
  >
    <StyledColorSchemeContent animate={controls} variant={variant}>
      Aa
    </StyledColorSchemeContent>
  </StyledColorSchemeBackground>
);

const StyledContainer = styled.div`
  position: relative;
`;

const StyledMixedColorSchemeSegment = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  display: flex;
  display: flex;
  height: 80px;
  overflow: hidden;
  width: 120px;
`;

const StyledCheckmarkContainer = styled(motion.div)`
  bottom: 0px;
  padding: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  right: 0px;
`;

export type ColorSchemeCardProps = {
  variant: `${Lowercase<ColorScheme>}`;
  selected?: boolean;
} & React.ComponentPropsWithoutRef<'div'>;

const checkmarkAnimationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const ColorSchemeCard = ({
  variant,
  selected,
  onClick,
}: ColorSchemeCardProps) => {
  const controls = useAnimation();

  const handleMouseEnter = () => {
    controls.start({
      height: 61,
      fontSize: '22px',
      transition: { duration: 0.1 },
    });
  };

  const handleMouseLeave = () => {
    controls.start({
      height: 56,
      fontSize: '20px',
      transition: { duration: 0.1 },
    });
  };

  if (variant === 'system') {
    return (
      <StyledContainer>
        <StyledMixedColorSchemeSegment
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={onClick}
        >
          <ColorSchemeSegment
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            controls={controls}
            variant="light"
          />
          <ColorSchemeSegment
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            controls={controls}
            variant="dark"
          />
        </StyledMixedColorSchemeSegment>
        <AnimatePresence>
          {selected && (
            <StyledCheckmarkContainer
              key="system"
              variants={checkmarkAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Checkmark />
            </StyledCheckmarkContainer>
          )}
        </AnimatePresence>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <ColorSchemeSegment
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        controls={controls}
        variant={variant}
        onClick={onClick}
      />
      <AnimatePresence>
        {selected && (
          <StyledCheckmarkContainer
            key={variant}
            variants={checkmarkAnimationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Checkmark />
          </StyledCheckmarkContainer>
        )}
      </AnimatePresence>
    </StyledContainer>
  );
};
