import { SendMailOptions } from 'nodemailer';

export interface EmailDriverInterface {
  send(sendMailOptions: SendMailOptions): Promise<void>;
}
