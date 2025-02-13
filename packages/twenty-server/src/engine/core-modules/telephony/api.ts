import https from 'https';

import axios from 'axios';

export const PABXapi = axios.create({
  baseURL: process.env.URL_PABX,
  headers: {
    usuario: process.env.USER_PABX,
    token: process.env.TOKEN_PABX,
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

export const PABXPRODapi = axios.create({
  baseURL: process.env.URL_PABX_PROD,
  headers: {
    usuario: process.env.USER_PABX_PROD,
    token: process.env.TOKEN_PABX_PROD,
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
