import { motion } from 'framer-motion';

type AnimatedEaseInProps = Omit<
  React.ComponentProps<typeof motion.div>,
  'initial' | 'animated' | 'transition'
> & {
  duration?: number;
};

export const AnimatedEaseIn = ({
  children,
  duration = 0.3,
  ...restProps
}: AnimatedEaseInProps) => {
  const initial = { opacity: 0 };
  const animate = { opacity: 1 };
  const transition = { ease: 'linear', duration };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      // eslint-disable-next-line twenty/no-spread-props
      {...restProps}
    >
      {children}
    </motion.div>
  );
};
