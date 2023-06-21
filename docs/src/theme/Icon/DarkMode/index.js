import React from 'react';
import { TbMoon } from 'react-icons/tb';
import {useColorMode} from '@docusaurus/theme-common';


export default function IconDarkMode(props) {
  const { colorMode } = useColorMode().colorMode;
  return colorMode === 'dark' ? <TbMoon /> : <></>;
}
