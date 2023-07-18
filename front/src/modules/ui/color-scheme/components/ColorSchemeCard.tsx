import React from 'react';
import styled from '@emotion/styled';
import {
  AnimatePresence,
  AnimationControls,
  motion,
  useAnimation,
} from 'framer-motion';

import { Checkmark } from '@/ui/checkmark/components/Checkmark';
import DarkNoise from '@/ui/themes/assets/dark-noise.png';
import LightNoise from '@/ui/themes/assets/light-noise.png';
import { grayScale } from '@/ui/themes/colors';
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
  border: ${({ variant }) => {
    switch (variant) {
      case 'dark':
        return `1px solid ${grayScale.gray65};`;
      case 'light':
      default:
        return `1px solid ${grayScale.gray20};`;
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
        return grayScale.gray70;
      case 'light':
        return theme.color.gray0;
    }
  }};

  border-left: ${({ variant }) => {
    switch (variant) {
      case 'dark':
        return `1px solid ${grayScale.gray55};`;
      case 'light':
      default:
        return `1px solid ${grayScale.gray20};`;
    }
  }};
  border-radius: ${({ theme }) => theme.border.radius.md} 0px 0px 0px;
  border-top: ${({ variant }) => {
    switch (variant) {
      case 'dark':
        return `1px solid ${grayScale.gray55};`;
      case 'light':
      default:
        return `1px solid ${grayScale.gray20};`;
    }
  }};
  box-sizing: border-box;
  color: ${({ variant }) => {
    switch (variant) {
      case 'dark':
        return grayScale.gray30;
      case 'light':
      default:
        return grayScale.gray55;
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

function ColorSchemeSegment({
  variant,
  controls,
  ...rest
}: ColorSchemeSegmentProps) {
  return (
    <StyledColorSchemeBackground variant={variant} {...rest}>
      <StyledColorSchemeContent animate={controls} variant={variant}>
        Aa
      </StyledColorSchemeContent>
    </StyledColorSchemeBackground>
  );
}

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

export function ColorSchemeCard({
  variant,
  selected,
  ...rest
}: ColorSchemeCardProps) {
  const controls = useAnimation();

  function handleMouseEnter() {
    controls.start({
      height: 61,
      fontSize: '22px',
      transition: { duration: 0.1 },
    });
  }

  function handleMouseLeave() {
    controls.start({
      height: 56,
      fontSize: '20px',
      transition: { duration: 0.1 },
    });
  }

  if (variant === 'system') {
    return (
      <AnimatePresence>
        <StyledContainer>
          <StyledMixedColorSchemeSegment
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...rest}
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
          {selected && (
            <StyledCheckmarkContainer
              variants={checkmarkAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Checkmark />
            </StyledCheckmarkContainer>
          )}
        </StyledContainer>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <StyledContainer>
        <ColorSchemeSegment
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          controls={controls}
          variant={variant}
          {...rest}
        />
        {selected && (
          <StyledCheckmarkContainer
            variants={checkmarkAnimationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Checkmark />
          </StyledCheckmarkContainer>
        )}
      </StyledContainer>
    </AnimatePresence>
  );
}
