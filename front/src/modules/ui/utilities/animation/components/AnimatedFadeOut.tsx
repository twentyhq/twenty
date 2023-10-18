import { AnimatePresence, motion } from 'framer-motion';

type AnimatedFadeOutProps = {
  isOpen: boolean;
  children: React.ReactNode;
  duration?: number;
  marginBottom?: string;
  marginTop?: string;
};

export const AnimatedFadeOut = ({
  isOpen,
  children,
  duration,
  marginBottom,
  marginTop,
}: AnimatedFadeOutProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 1,
            marginBottom: marginBottom ?? 0,
            marginTop: marginTop ?? 0,
          }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, marginTop: 0 }}
          transition={{ duration: duration ?? 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
