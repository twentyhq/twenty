import { SendMailOptions } from 'nodemailer';

export interface EmailDriver {
  send(sendMailOptions: SendMailOptions): Promise<void>;
}
