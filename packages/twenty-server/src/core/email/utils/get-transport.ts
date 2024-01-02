export const getTransport = () => {
  if (process.env.USE_LOGGER_TRANSPORT) {
    return {
      name: 'logger',
      version: '0.1.0',
      send: (mail, callback) => {
        const info =
          `Sent email to: ${mail.data.to}\n` +
          `From: ${mail.data.from}\n` +
          `Subject: ${mail.data.subject}\n` +
          `Content Text: ${mail.data.text}\n` +
          `Content HTML: ${mail.data.html}`;

        console.log(info);
        callback(null, true);
      },
    };
  }

  const port = parseInt(process.env.EMAIL_SERVER_PORT || '');
  const auth =
    process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD
      ? {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        }
      : undefined;

  return {
    host: process.env.EMAIL_SERVER_HOST,
    port,
    auth,
  };
};
