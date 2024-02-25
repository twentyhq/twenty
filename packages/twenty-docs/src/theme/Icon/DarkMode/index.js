import React from 'react';
import { TbMoon } from 'react-icons/tb';
import { useColorMode } from '@docusaurus/theme-common';

const IconDarkMode = (props) => {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? <TbMoon className="navbar__link" /> : <></>;
};

export default IconDarkMode;
