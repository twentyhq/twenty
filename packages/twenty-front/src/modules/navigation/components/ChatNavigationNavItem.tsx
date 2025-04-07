import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { Theme, useTheme } from '@emotion/react';
// eslint-disable-next-line no-restricted-imports
import { IconBrandWechat } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IconBriefcase, IconHeadphones } from 'twenty-ui/display';

const navItemsAnimationVariants = (theme: Theme) => ({
  hidden: {
    height: 0,
    opacity: 0,
    marginTop: 0,
  },
  visible: {
    height: 'auto',
    opacity: 1,
    marginTop: theme.spacing(1),
  },
});

export const ChatNavigationNavItem = () => {
  const theme = useTheme();
  const { pathname, search } = useLocation();
  const currentPathWithSearch = pathname + search;
  const [currentPath, setCurrentPath] = useState(currentPathWithSearch);

  const navigationPath = '/chat';

  const chatsPath = [
    {
      id: 'internalChat',
      label: 'Internal Chat',
      path: `${navigationPath}/internal`,
      Icon: IconBriefcase,
    },
    {
      id: 'callCenter',
      label: 'Call Center',
      path: `${navigationPath}/call-center`,
      Icon: IconHeadphones,
    },
  ];

  const shouldSubItemsBeDisplayed = pathname.startsWith(navigationPath);

  return (
    <>
      <NavigationDrawerItem
        label="Chat"
        to={`${navigationPath}/internal`}
        active={pathname.startsWith(navigationPath)}
        Icon={IconBrandWechat}
      />
      <AnimatePresence>
        {shouldSubItemsBeDisplayed && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={navItemsAnimationVariants(theme)}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {chatsPath.map(({ id, label, path, Icon }) => {
              return (
                <div key={id} onClick={() => setCurrentPath(path)}>
                  <NavigationDrawerSubItem
                    label={label}
                    to={path}
                    active={
                      currentPath === path || currentPathWithSearch === path
                    }
                    Icon={Icon}
                  />
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
