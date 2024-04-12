import { IsOptional } from 'class-validator';

export class FormDataDTO {
  @IsOptional()
  email: string;

  firstName: string;

  @IsOptional()
  lastName: string;

  @IsOptional()
  appointmentDate: Date;

  @IsOptional()
  contactNumber: string;

  @IsOptional()
  appointmentLocation: string;

  @IsOptional()
  reasonForAppointment: string;

  @IsOptional()
  consent: string;

  @IsOptional()
  appointmentType: string;
}
