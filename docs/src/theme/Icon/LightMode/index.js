import React from 'react';
import { TbSun } from 'react-icons/tb';
import {useColorMode} from '@docusaurus/theme-common';


const IconLightMode = (props) =>  {
  const { colorMode } = useColorMode().colorMode;
  return colorMode === 'dark' ? <></>: <TbSun /> ;
}

export default IconLightMode;
