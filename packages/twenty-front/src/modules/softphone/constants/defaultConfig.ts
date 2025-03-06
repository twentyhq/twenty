import { SipConfig } from '../types/sipConfig';

const defaultConfig: SipConfig = {
  username: '',
  password: '',
  domain: 'suite.pabx.digital',
  proxy: 'webrtc.dazsoft.com:8080',
  protocol: 'wss://',
  authorizationHa1: '',
};

export default defaultConfig;
