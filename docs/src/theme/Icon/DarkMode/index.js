import React from 'react';
import { TbMoon } from 'react-icons/tb';
import {useColorMode} from '@docusaurus/theme-common';


const IconDarkMode = (props) => {
  const { colorMode } = useColorMode().colorMode;
  return colorMode === 'dark' ? <TbMoon /> : <></>;
}

export default IconDarkMode