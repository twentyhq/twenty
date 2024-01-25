import { useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, useMotionValue, useTransform } from 'framer-motion';

import {
  Background,
  MovingImage,
} from '@/ui/layout/animated-placeholder/constants/AnimatedImages';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

interface StyledImageProps {
  type: string;
}

const StyledBackgroundImage = styled.img<StyledImageProps>`
  max-height: ${({ type }) =>
    type === 'error500' || type === 'error404' ? '245px' : '160px'};
  max-width: ${({ type }) =>
    type === 'error500' || type === 'error404' ? '245px' : '160px'};
`;

const StyledMovingImage = styled(motion.img)<StyledImageProps>`
  position: absolute;
  max-width: ${({ type }) =>
    type === 'error500' || type === 'error404' ? '185px' : '130px'};
  max-height: ${({ type }) =>
    type === 'error500' || type === 'error404' ? '185px' : '130px'};
  z-index: 2;
`;

interface AnimatedPlaceholderProps {
  type: keyof typeof Background | keyof typeof MovingImage;
}

const AnimatedPlaceholder = ({ type }: AnimatedPlaceholderProps) => {
  const x = useMotionValue(window.innerWidth / 2);
  const y = useMotionValue(window.innerHeight / 2);

  const translateX = useTransform(x, [0, window.innerWidth], [-2, 2]);
  const translateY = useTransform(y, [0, window.innerHeight], [-2, 2]);

  useEffect(() => {
    const handleMove = (event: MouseEvent | TouchEvent) => {
      const clientX =
        'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY =
        'touches' in event ? event.touches[0].clientY : event.clientY;

      x.set(clientX);
      y.set(clientY);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, [x, y]);

  return (
    <StyledContainer>
      <StyledBackgroundImage
        src={Background[type]}
        alt="Background"
        type={type}
      />
      <StyledMovingImage
        src={MovingImage[type]}
        alt="Moving"
        style={{ translateX, translateY }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        type={type}
      />
    </StyledContainer>
  );
};

export default AnimatedPlaceholder;
