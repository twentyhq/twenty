export type SMSText = {
  id: string;
  sender: string;
  body: string;
  date: Date;
};

export type TwilioMessage = {
  sid: string;
  from: string;
  body: string;
  date_sent: string | Date;
};
