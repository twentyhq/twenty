import { useTheme } from '@emotion/react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconFolder, IconFolderOpen } from 'twenty-ui';

export const AnimatedFolderIcon = ({
  isOpen,
  id,
}: {
  isOpen: boolean;
  id: string;
}) => {
  const theme = useTheme();

  return (
    <div
      style={{
        position: 'relative',
        width: theme.icon.size.md,
        height: theme.icon.size.md,
      }}
    >
      <AnimatePresence>
        <motion.div
          key={`${id}-${isOpen ? 'open' : 'closed'}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {isOpen ? (
            <IconFolderOpen
              style={{ minWidth: theme.icon.size.md }}
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.md}
            />
          ) : (
            <IconFolder
              style={{ minWidth: theme.icon.size.md }}
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.md}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedFolderIcon;
