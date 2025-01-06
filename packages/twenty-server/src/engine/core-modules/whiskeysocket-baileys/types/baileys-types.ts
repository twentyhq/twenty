import { IsString, IsNotEmpty, Matches, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum eWAMimeType {
    JPEG = 'image/jpeg',
    MP4 = 'video/mp4',
    EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    PDF = 'application/pdf',
    WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    TEXT = 'text/plain'
}

export class FileDataDto {

    @IsNotEmpty()
    @IsString()
    fileBuffer: string ;

    @IsNotEmpty()
    @IsString()
    fileName: string;

    @IsNotEmpty()
    mimetype: eWAMimeType;

    @IsOptional()
    @IsString()
    filePath?: string;

    constructor(fileBuffer: string, fileName: string, mimetype: eWAMimeType,filePath?: string) {
        this.fileBuffer = fileBuffer;
        this.fileName = fileName;
        this.mimetype = mimetype;
        this.filePath = filePath;
    }

}

export class MessageDto extends FileDataDto{
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{12}$/, { message: 'WANumber must be a 12-digit number starting with a country code (e.g., 919045672345)'})
    WANumber: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => FileDataDto)
    fileData?: FileDataDto;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{12}@s\.whatsapp\.net$/, { message: 'Invalid format, correct format:919876512345@s.whatsapp.net'})
    jid: string | boolean;

    constructor(WANumber: string, message: string, fileData?: FileDataDto | any) {
        super(fileData?.fileBuffer,fileData?.fileName,fileData?.mimetype,fileData?.filePath)
        this.WANumber = WANumber;
        this.message = message;
        this.fileData = fileData;
        this.jid = !!WANumber && `${WANumber}@s.whatsapp.net`;
    }
}
