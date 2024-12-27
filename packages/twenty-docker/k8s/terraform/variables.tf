######################
# Required Variables #
######################
variable "twentycrm_pgdb_admin_password" {
  type        = string
  description = "TwentyCRM password for postgres database."
  sensitive   = true
}

variable "twentycrm_app_hostname" {
  type        = string
  description = "The protocol, DNS fully qualified hostname, and port used to access TwentyCRM in your environment. Ex: https://crm.example.com:443"
}

######################
# Optional Variables #
######################
variable "twentycrm_app_name" {
  type        = string
  default     = "twentycrm"
  description = "A friendly name prefix to use for every component deployed."
}

variable "twentycrm_server_image" {
  type        = string
  default     = "twentycrm/twenty:latest"
  description = "TwentyCRM server image for the server deployment. This defaults to latest. This value is also used for the workers image."
}

variable "twentycrm_db_image" {
  type        = string
  default     = "twentycrm/twenty-postgres-spilo:latest"
  description = "TwentyCRM image for database deployment. This defaults to latest."
}

variable "twentycrm_server_replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the TwentyCRM server deployment. This defaults to 1."
}

variable "twentycrm_worker_replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the TwentyCRM worker deployment. This defaults to 1."
}

variable "twentycrm_db_replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the TwentyCRM database deployment. This defaults to 1."
}

variable "twentycrm_server_data_mount_path" {
  type        = string
  default     = "/app/packages/twenty-server/.local-storage"
  description = "TwentyCRM mount path for servers application data. Defaults to '/app/packages/twenty-server/.local-storage'."
}

variable "twentycrm_db_pv_path" {
  type        = string
  default     = ""
  description = "Local path to use to store the physical volume if using local storage on nodes."
}

variable "twentycrm_server_pv_path" {
  type        = string
  default     = ""
  description = "Local path to use to store the physical volume if using local storage on nodes."
}

variable "twentycrm_db_pv_capacity" {
  type        = string
  default     = "10Gi"
  description = "Storage capacity provisioned for database persistent volume."
}

variable "twentycrm_db_pvc_requests" {
  type        = string
  default     = "10Gi"
  description = "Storage capacity reservation for database persistent volume claim."
}

variable "twentycrm_server_pv_capacity" {
  type        = string
  default     = "10Gi"
  description = "Storage capacity provisioned for server persistent volume."
}

variable "twentycrm_server_pvc_requests" {
  type        = string
  default     = "10Gi"
  description = "Storage capacity reservation for server persistent volume claim."
}

variable "twentycrm_namespace" {
  type        = string
  default     = "twentycrm"
  description = "Namespace for all TwentyCRM resources"
}

variable "twentycrm_redis_replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the TwentyCRM Redis deployment. This defaults to 1."
}

variable "twentycrm_redis_image" {
  type        = string
  default     = "redis/redis-stack-server:latest"
  description = "TwentyCRM image for Redis deployment. This defaults to latest."
}

variable "twentycrm_docker_data_mount_path" {
  type        = string
  default     = "/app/docker-data"
  description = "TwentyCRM mount path for servers application data. Defaults to '/app/docker-data'."
}

variable "twentycrm_docker_data_pv_path" {
  type        = string
  default     = ""
  description = "Local path to use to store the physical volume if using local storage on nodes."
}

variable "twentycrm_docker_data_pv_capacity" {
  type        = string
  default     = "100Mi"
  description = "Storage capacity provisioned for server persistent volume."
}

variable "twentycrm_docker_data_pvc_requests" {
  type        = string
  default     = "100Mi"
  description = "Storage capacity reservation for server persistent volume claim."
}
