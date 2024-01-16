import { useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, useMotionValue, useTransform } from 'framer-motion';

import {
  Background,
  MovingImage,
} from '@/ui/layout/animated-placeholder/constants/AnimatedImages';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StyledBackgroundImage = styled.img`
  max-width: 160px;
`;

const StyledMovingImage = styled(motion.img)`
  position: absolute;
  max-width: 130px;
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
    const handleMouseMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [x, y]);

  return (
    <StyledContainer>
      <StyledBackgroundImage src={Background[type]} alt="Background" />
      <StyledMovingImage
        src={MovingImage[type]}
        alt="Moving"
        style={{
          translateX,
          translateY,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      />
    </StyledContainer>
  );
};

export default AnimatedPlaceholder;
