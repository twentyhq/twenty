import { motion } from 'framer-motion';

interface Props
  extends Omit<
    React.ComponentProps<typeof motion.div>,
    'initial' | 'animated' | 'transition'
  > {
  duration?: number;
}

export function AnimatedEaseIn({
  children,
  duration = 0.8,
  ...restProps
}: Props) {
  const initial = { opacity: 0 };
  const animate = { opacity: 1 };
  const transition = { ease: 'linear', duration };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      {...restProps}
    >
      {children}
    </motion.div>
  );
}
