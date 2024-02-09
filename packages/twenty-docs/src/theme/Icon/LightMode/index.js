import React from 'react';
import { TbSun } from 'react-icons/tb';
import { useColorMode } from '@docusaurus/theme-common';

const IconLightMode = (props) => {
  const { colorMode } = useColorMode();
  return colorMode === 'light' ? <TbSun className="navbar__link" /> : <></>;
};

export default IconLightMode;
