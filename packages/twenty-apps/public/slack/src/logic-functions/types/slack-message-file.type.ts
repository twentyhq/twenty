export type SlackMessageFile = {
  id?: string;
  name?: string;
  title?: string;
  mimetype?: string;
  size?: number;
  url_private?: string;
  // Slack Connect and restricted uploads arrive as stubs carrying this, with
  // no name and no usable URL until files.info is called
  file_access?: string;
};
